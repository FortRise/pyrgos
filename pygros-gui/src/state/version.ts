export type Version = {
    major: number,
    minor: number,
    build: number
}

export function parseVersion(str: string): Version | null 
{
    if (typeof(str) != 'string') { return null; }

    var arr = str.split('.');

    // parse int or default to 0
    var maj = parseInt(arr[0]) || 0;
    var min = parseInt(arr[1]) || 0;
    var rest = parseInt(arr[2]) || 0;
    return {
        major: maj,
        minor: min,
        build: rest
    }
}