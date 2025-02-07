const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const fs = require("fs");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const HtmlWebpackPartialsPlugin = require("html-webpack-partials-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

// const LazyLoadConfig = require("./lazy-load.config");

let mode = "development";
if (process.env.NODE_ENV === "production") {
  mode = "production";
}
const SRC_FOLDER = path.join(process.cwd(), "src");
const DIST_FOLDER = path.join(process.cwd(), "dist");

let lands = fs.readdirSync(SRC_FOLDER, { encoding: "utf8", withFileTypes: true });
lands = lands.filter(land => land.isDirectory() && land.name !== "common").map(l => l.name);

if (process.env.npm_config_landing) {
  const land = lands.find(l => l === process.env.npm_config_landing);
  if (land) {
    lands = [land];
    console.log(`Building landing "${land}" by --landing param...`);
  }
}

const pages = lands.map(land => ({
  chunks: [land],
  page: `${land}/index.html`,
  template: path.join(__dirname, `src/${land}/index.html`),
}));

const favicons = lands.map((land) => {
  const files = fs.readdirSync(path.join(SRC_FOLDER, land), { encoding: "utf8", withFileTypes: true });
  const favicon = files.find(f => f.isFile() && f.name.includes("favicon") && f.name !== "favicon.ico");
  if (favicon) {
    return new FaviconsWebpackPlugin({
      logo: path.join(SRC_FOLDER, land, favicon.name),
      outputPath: path.join(DIST_FOLDER, land),
      inject: false,
      favicons: {
        icons: {
          android: false,
          appleIcon: false,
          appleStartup: false,
          favicons: [
            { name: "favicon.ico" },
          ],
          windows: false,
          yandex: false,
        },
      },
    });
  }

  return null;
}).filter(f => !!f);

const copyFolders = lands.map(land => ([
  (land === "blank" ? null : { from: `${SRC_FOLDER}/${land}/img`, to: `${DIST_FOLDER}/${land}/img` }),
])).flat().filter(f => f);

const htmlPlugins = pages.map(
  (page) => {
    const landing = page.page.replace("/index.html", "");
    return [
      new HtmlWebpackPlugin({
        inject: true,
        template: page.template,
        filename: page.page,
        chunks: [...page.chunks],
      }),
      null
    ];
  },
).flat().filter(f => f);

const MiniCssPlugin = pages.map(
  () => new MiniCssExtractPlugin({
    filename: "[name]/css/main.[contenthash].css",
  }),
);

module.exports = {
  mode,
  devServer: {
    historyApiFallback: true,
    static: {
        directory: path.join(__dirname, "dist"),
    },
    open: true,
    compress: true,
    hot: false,
    host: "0.0.0.0",
    port: 8080,
  },
  stats: {
    children: true,
  },

  entry: lands.reduce((config, land) => ({
    ...config,
    [land]: `./src/${land}/js/app.js`,
  }), {}),

  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name]/js/app.[contenthash].js",
    assetModuleFilename: ({ filename }) => (`${filename.replace("src/", "")}[query]`),
    clean: true,
  },
  devtool: "source-map",
  plugins: [
    ...htmlPlugins,
    ...favicons,
    ...MiniCssPlugin,
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        ...copyFolders.flat(),
      ],
    }),
  ],
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ["jpegtran", { progressive: true, optimizationLevel: 5 }],
              ["optipng", { optimizationLevel: 5 }],
            ],
          },
        },

      }),
    ],
    splitChunks: {
      chunks: "all",
    },
  },

  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          sources: {
            list: [
              "...",
              {
                tag: "img",
                attribute: "data-src",
                type: "src",
              },
              {
                tag: "source",
                attribute: "data-src",
                type: "src",
              },
              {
                tag: "source",
                attribute: "data-srcset",
                type: "srcset",
              },
              {
                tag: "video",
                attribute: "data-src",
                type: "src",
              },
              {
                tag: "audio",
                attribute: "data-src",
                type: "src",
              },
            ],
          },
        },
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: "defaults" }],
            ],
          },
        },
      },
      {
        test: /\.(?:ico|svg|gif|png|jpg|jpeg|webp)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|)$/,
        type: "asset/resource",
      },
      {
        test: /\.(scss|css)$/,
        use: [
          (mode === "development") ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "postcss-preset-env",
                    [
                      // Options
                    ],
                  ],
                ],
              },
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
};