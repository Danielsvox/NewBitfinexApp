module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated/plugin removed: Reanimated v4 is handled automatically by babel-preset-expo
  };
};


