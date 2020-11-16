function isWslPath(wslPath) { // simple check
    return wslPath.includes('/mnt/');
}

function unsafeWslToWindowsSync (wslPath) { // convert wsl path to windows
    const parsedWslPath = wslPath.split('/');
    const usersIndex = parsedWslPath.indexOf('Users');
    const winVD = parsedWslPath[usersIndex - 1].toUpperCase() + ":/"; // get virtual disk name
    const winUserPath =  parsedWslPath.slice(usersIndex,parsedWslPath.length - 1);
    return winVD + winUserPath.join('/');
}

function wslToWindowsSync(wslPath) {
    if (isWslPath(wslPath)) return unsafeWslToWindowsSync(wslPath);
    return undefined;
}

module.exports = {
    isWslPath: isWslPath,
    wslToWindowsSync: wslToWindowsSync,
}
