//@ts-check
import { world, system, ItemStack, BlockPermutation, EntityEquippableComponent, EquipmentSlot, Player, GameMode, Direction } from "@minecraft/server";
import { decide } from "./random";

const
    axes = [
        "wooden",
        "stone",
        "iron",
        "golden",
        "diamond",
        "netherite"
    ].map(value=>`minecraft:${value}_axe`),
    /**@type {readonly ["oak", "birch", "spruce", "jungle", "acacia", "dark_oak", "mangrove" ,"cherry"]}*/
    overworldTypes = [
        "oak",
        "birch",
        "spruce",
        "jungle",
        "acacia",
        "dark_oak",
        "mangrove",
        "cherry"
    ],
    toxicLevel = {
        oak: 0.2,
        birch: 0.4,
        spruce: 0.1,
        jungle: 0.8,
        acacia: 0.5,
        dark_oak: 0.3,
        mangrove: 0.7,
        cherry: 0.6,
        crimson: 1.0,
        warped: 1.0,
        bamboo: 0.6
    },
    logs = [
        ...overworldTypes.map(value=>`minecraft:${value}_log`),
        ...overworldTypes.map(value=>`minecraft:${value}_wood`),
        "minecraft:crimson_stem",
        "minecraft:warped_stem",
        "minecraft:crimson_hyphae",
        "minecraft:warped_hyphae",
        "minecraft:bamboo_block"
    ],
    stripped_logs = logs.map(value=>value.replace("minecraft:", "minecraft:stripped_"));

/**
 * @param {string} id
 * @returns {typeof overworldTypes[number] | "crimson" | "warped" | "bamboo"}*/
function getType(id){
    for(let i = 0; i < overworldTypes.length; i++) if(id.replace("minecraft:", "").replace("abs:", "").replace("stripped_", "").replace("_wood", "").replace("_log", "").replace("_bark", "") === overworldTypes[i]) return overworldTypes[i];
    if(id.includes("crimson")) return "crimson";
    else if(id.includes("warped")) return "warped";
    else if(id.includes("bamboo")) return "bamboo";
    world.sendMessage("§c模组出现了一个 bug。请立即将相关信息报告给开发者，谢谢。");
    console.error(`Wood type in barks mod got ${id}!`);
    return "oak";
}

/**
 * @param {string} id
 * @returns {boolean}*/
function isModItem(id){
    return id.includes("abs:") && id.includes("_bark");
}

world.beforeEvents.playerInteractWithBlock.subscribe(data=>{
    if(data.itemStack && axes.includes(data.itemStack.typeId) && logs.includes(data.block.typeId)){
        const {block, player} = data, blockLocation = block.location, playerLocation = player.location, spawnLocation = (()=>{
            const
                lnX = Math.sign(playerLocation.x - blockLocation.x) * Math.log1p(Math.abs(playerLocation.x - blockLocation.x)),
                lnY = Math.sign(playerLocation.y - blockLocation.y) * Math.log1p(Math.abs(playerLocation.y - blockLocation.y)),
                lnZ = Math.sign(playerLocation.z - blockLocation.z) * Math.log1p(Math.abs(playerLocation.z - blockLocation.z));
            let deltaX = lnX * 0.25,
                deltaY = lnY * 0.25,
                deltaZ = lnZ * 0.25;
            if(Math.abs(deltaX) >= 0.4){
                const factor = 0.4 / lnX;
                deltaX = 0.4;
                deltaY = lnY * factor;
                deltaZ = lnZ * factor;
            }
            if(Math.abs(deltaY) >= 0.4){
                const factor = 0.4 / lnY;
                deltaY = 0.4;
                deltaX = lnX * factor;
                deltaZ = lnZ * factor;
            }
            if(Math.abs(deltaZ) >= 0.4){
                const factor = 0.4 / lnZ;
                deltaZ = 0.4;
                deltaX = lnX * factor;
                deltaY = lnY * factor;
            }
            return {
                x: blockLocation.x + 0.5 + deltaX,
                y: blockLocation.y + 0.5 + deltaY,
                z: blockLocation.z + 0.5 + deltaZ,
            };
        })();
        system.run(()=> block.dimension.spawnItem(new ItemStack(`abs:${getType(block.typeId)}_bark`, 1), spawnLocation));
    }
});

world.beforeEvents.itemUseOn.subscribe(data=>{
    if(data.source.typeId === "minecraft:player" && data.itemStack && stripped_logs.includes(data.block.typeId) && isModItem(data.itemStack.typeId) && getType(data.block.typeId) === getType(data.itemStack.typeId)){
        const {itemStack, source, block} = data;
        system.run(()=>{
            block.setPermutation(BlockPermutation.resolve(block.typeId.replace("stripped_", ""), block.typeId.includes("wood") && getType(block.typeId) !== "cherry" && getType(block.typeId) !== "mangrove" ? block.permutation.withState("stripped_bit", false).getAllStates() : block.permutation.getAllStates()));
            switch(getType(block.typeId)){
                case "oak":
                case "spruce":
                case "acacia":
                case "birch":
                case "dark_oak":
                case "jungle":
                case "mangrove":
                    block.dimension.playSound("fall.wood", {
                        x: block.location.x + 0.5,
                        y: block.location.y + 0.5,
                        z: block.location.z + 0.5
                    }, {
                        pitch: 1.0,
                        volume: 0.9
                    });
                    break;
                case "bamboo":
                    block.dimension.playSound("fall.bamboo_wood", {
                        x: block.location.x + 0.5,
                        y: block.location.y + 0.5,
                        z: block.location.z + 0.5
                    }, {
                        pitch: 1.0,
                        volume: 0.9
                    });
                    break;
                    break;
                case "cherry":
                    block.dimension.playSound("fall.cherry_wood", {
                        x: block.location.x + 0.5,
                        y: block.location.y + 0.5,
                        z: block.location.z + 0.5
                    }, {
                        pitch: 1.0,
                        volume: 0.9
                    });
                    break;
                case "crimson":
                case "warped":
                    block.dimension.playSound("fall.nether_wood", {
                        x: block.location.x + 0.5,
                        y: block.location.y + 0.5,
                        z: block.location.z + 0.5
                    }, {
                        pitch: 1.0,
                        volume: 0.9
                    });
                    break;
            }
            const gamemode = source.getGameMode(), hand = /**@type {EntityEquippableComponent}*/ (source.getComponent("equippable")).getEquipmentSlot(EquipmentSlot.Mainhand);
            if(gamemode === GameMode.adventure || gamemode === GameMode.survival) system.run(()=>{
                if(itemStack.amount > 1){
                    const newItem = itemStack.clone();
                    newItem.amount--;
                    hand.setItem(newItem);
                }
                else hand.setItem();
            });
        });
    }
});

world.afterEvents.itemCompleteUse.subscribe(data=>{
    if(isModItem(data.itemStack.typeId)){
        if(decide(0.8)) data.source.addEffect("minecraft:hunger", 400);
        if(decide(toxicLevel[getType(data.itemStack.typeId)])) data.source.addEffect("minecraft:poison", 160);
        if(getType(data.itemStack.typeId) === "warped" && decide(0.2)) data.source.addEffect("minecraft:nausea", 120);
    }
});