function isWslPath(wslPath) {
  // simple check
  return wslPath.includes('/mnt/');
}

function toWindowsSyncUnsafe(wslPath) {
  // convert wsl path to windows
  const parsedWslPath = wslPath.split('/');
  const usersIndex = parsedWslPath.indexOf('Users');
  const winVD = parsedWslPath[usersIndex - 1].toUpperCase() + ':/'; // get virtual disk name
  const winUserPath = parsedWslPath.slice(usersIndex, parsedWslPath.length);
  return winVD + winUserPath.join('/');
}

function ToWindowsSync(wslPath) {
  if (isWslPath(wslPath)) return toWindowsSyncUnsafe(wslPath);
  return undefined;
}

function toWslSyncUnsafe(winPath) {
  // convert windows path to unix
  const parsedWinPath = winPath.split('/');
  const usersIndex = parsedWinPath.indexOf('Users');
  const winVD = parsedWinPath[usersIndex - 1].toLowerCase().slice(0, -1); // get virtual disk name
  const unixUserPath = parsedWinPath.slice(usersIndex, parsedWinPath.length);
  return '/mnt/' + winVD + '/' + unixUserPath.join('/');
}

function toWslSync(winPath) {
  return toWslSyncUnsafe(winPath);
}

module.exports = {
  toWindowsSync: ToWindowsSync,
  toWslSync: toWslSync,
};
