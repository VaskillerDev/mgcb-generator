function isWslPath(wslPath) {
  // simple check
  return wslPath.includes('/mnt/');
}

function toWindowsSyncUnsafe(wslPath) {
  // convert wsl path to windows
  const parsedWslPath = wslPath.split('/');
  const usersIndex = parsedWslPath.indexOf('Users');
  const winVD = parsedWslPath[usersIndex - 1].toUpperCase() + ':/'; // get virtual disk name
  const winUserPath = parsedWslPath.slice(usersIndex, parsedWslPath.length - 1);
  return winVD + winUserPath.join('/');
}

function ToWindowsSync(wslPath) {
  if (isWslPath(wslPath)) return toWindowsSyncUnsafe(wslPath);
  return undefined;
}

module.exports = {
  isWslPath: isWslPath,
  toWindowsSync: ToWindowsSync,
};
