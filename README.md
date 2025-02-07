# landings

## Билд определённого лендинга
Во время запуска `npm run dev` или `npm build` можно добавить параметр командной строки `--landing=name`, чтобы собирать только определённый лендинг.
Пример:
```
npm run dev --landing=anydesk
```

## Оптимизация

### Webp

В webpack-конфиге описан пресет генератора webp. Для использования, в верстке нужно просто добавить к src изображения query-параметр as=webp, например
```html
<img src="awesome-image.png" />
<!-- to --->
<img src="awesome-image.png?as=webp" />
```

В верстке использовал замену с фолбэком
```html
<picture>
  <source type="image/webp" srcset="awesome-image.png?as=webp">
  <img src="awesome-image.png" />
</picture>
```

Для подобной замены в дальшейшем можно пользоваться массовой заменой по регулярке в vscode. Тогда regexp
```html
<img (.*)src="(.*)\.png"(.*)>
```
заменять на
```html
<picture><source type="image/webp" srcset="$2.png?as=webp"><img $1src="$2.png"$3></picture>
```

### Сборка
Изначально у нас этап генерации webp и avif был включён в сборку и происходил каждый раз. Из-за его работы сборка в проде в какой-то момент по времени стала превышать 35 минут. Было решено делать это единожды и алгоритм работы теперь такой:
1. Прописываем где нужно в html ?as=webp|avif.
2. Запускаем локально сборку `npm run build -landing=${имя папки в src} --images`.
3. Из полученной папки /dist/landing_name/img копируем изображения в /src/landing_name/img. Исключаем изображения из common:
   1. bottom-left.svg
   2. bottom-right.svg
   3. steps-arrow-2.svg
   4. top-left.svg
   5. top-right.svg
   6. square-close.svg
4. Коммитим изображения в репозиторий.

### Lazy Loading

Для медиа-файлов (изображений/видео) можно подключить lazy-загрузку.

Для этого необходимо:

1. В файле конфига `lazy-load.config.js` нужно добавить название лендинга по примеру:
```js
{
  "adobe-flash-player": true,
  "adobe-reader": true,
}
```
После этого на страницу с лендингом подключится скрипт от [vanilla-lazyload.js](https://github.com/verlok/vanilla-lazyload).

2. У медиафайлов:
  - добавить класс `lazy`
  - аттрибут `src` заменить на `data-src`
  - аттрибут `srcset` заменить на `data-srcset`

Пример c `<img>`:
```html
<img src="(.*)\.png"(.*)>
```
заменять на:
```html
<img class="lazy" data-src="(.*)\.png"(.*)>
```

Пример c `<picture>` + `<source>` + `<img>`:

```html
<picture src="(.*)\.mp4"(.*)>
  <source srcset="(.*)\.png"(.*)>
  <img src="(.*)\.png"(.*)>
</picture>
```
заменять на:
```html
<picture>
  <source class="lazy" data-srcset="(.*)\.png"(.*)>
  <img class="lazy" data-src="(.*)\.png"(.*)>
</picture>
```

Пример c `<video>`:

```html
<video src="(.*)\.mp4"(.*)>
  <source src="(.*)\.mp4"(.*) />
</video>
```
заменять на:
```html
<video class="lazy" data-src="(.*)\.mp4"(.*)>
  <source class="lazy" data-src="(.*)\.mp4"(.*) />
</video>
```

Подробнее в документации от [vanilla-lazyload.js](https://github.com/verlok/vanilla-lazyload).
