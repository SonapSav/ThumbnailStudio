Drop image assets in this folder.

Reference them in an Image layer's `src` field by filename only, e.g.:
    logo.png
    photos/hero.jpg

ThumbnailStudio resolves bare filenames here via Remotion's staticFile().
Full URLs (https://...) and data: URIs also work in the `src` field.
