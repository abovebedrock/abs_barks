//@ts-check

/**概率相同地返回包含最小值和最大值之间的随机数字。
 * @param {number} min 最小值。
 * @param {number} max 最大值。
 * @returns {number}
 */
export function randomInt(min, max){
    let random = Math.random();
    while(random === 1) random = Math.random();
    return Math.floor(random * (max - min + 1)) + min;
}

/**根据某件事**成立**的概率，返回成立或不成立。
 * @param {number} possibility 0 到 1 的小数。
 * @returns {boolean}
 */
export function decide(possibility){
    if(possibility === 1) return true;
    else if(possibility === 0) return false;
    else return Math.random() < possibility;
}