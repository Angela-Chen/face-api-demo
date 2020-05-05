# basic-webpack4 介绍


## 资源管理

### 加载CSS
为了在 JavaScript 模块中 import 一个 CSS 文件，你需要安装 style-loader 和 css-loader，并在 module 配置 中添加这些 loader：

`npm install --save-dev style-loader css-loader`

### 加载 images 图像
css中background 和 icon 这样的图像，使用 file-loader，我们可以轻松地将这些内容混合到 CSS 中：

`npm install --save-dev file-loader`

在 `import MyImage from './my-image.png'` 时，此图像将被处理并添加到 output 目录，并且 MyImage 变量将包含该图像在处理后的最终 url。在使用 css-loader 时，如前所示，会使用类似过程处理你的 CSS 中的 url('./my-image.png')。loader 会识别这是一个本地文件，并将 './my-image.png' 路径，替换为 output 目录中图像的最终路径。而 html-loader 以相同的方式处理 `<img src="./my-image.png" />`

### 加载 fonts 字体
file-loader 和 url-loader 可以接收并加载任何文件，然后将其输出到构建目录。这就是说，我们可以将它们用于任何类型的文件，也包括字体。


配置好 loader 并将字体文件放在合适的位置后，你可以通过一个 @font-face 声明将其混合。本地的 url(...) 指令会被 webpack 获取处理，就像它处理图片一样：

### 启用 HMR
首先，在devServer配置段中开启HMR，
然后，在插件列表中添加插件：`new webpack.HotModuleReplacementPlugin()`

此功能可以很大程度提高生产效率。

## 多环境分离

development(开发环境) 和 production(生产环境) 这两个环境下的构建目标存在着巨大差异。

在开发环境中，我们需要：强大的 source map 和一个有着 live reloading(实时重新加载) 或 hot module replacement(热模块替换) 能力的 localhost server。

而生产环境目标则转移至其他方面，关注点在于压缩 bundle、更轻量的 source map、资源优化等，通过这些优化方式改善加载时间。

由于要遵循逻辑分离，我们通常建议为每个环境编写彼此独立的 webpack 配置。

首先，安装插件：`npm install --save-dev webpack-merge`

然后，分割配置文件到不同的环境


我们鼓励你在生产环境中启用 source map，因为它们对 debug(调试源码) 和运行 benchmark tests(基准测试) 很有帮助。

`避免在生产中使用 inline-*** 和 eval-***，因为它们会增加 bundle 体积大小，并降低整体性能。`
