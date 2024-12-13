export function getDateDiff(start : string, end : string) {
    const startObj = new Date(start); 
    const endObj = new Date(end);
    const timeDiff = endObj.getTime() - startObj.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24) + 1;
    return daysDiff;
}