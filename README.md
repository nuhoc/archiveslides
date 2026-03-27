# NUHOC Archival Slide Site
This repo contains images scanned by Jonah Lefkoff of over 1000 slides from the Northeastern Archives of NUHOC from the 70s to 90s.

## Usage
The images are tagged in lightroom and exported to `images/full`. Then you can run `scripts/extract-metadata.sh` to extract the metadata from the lightroom exports and save it to `_data/photos.json`. The metadata is then used to generate the site using 11ty.

## Building the site
To build the site, you can run `yarn` to install packages and `yarn build` to build the site. The built site will be in the `_site` directory. You can also run `yarn serve` to start a development server with hot reloading.

## License
The code in this repo is licensed under the MIT License. See [LICENSE](LICENSE) for more details.
The photographs contained in the `images/` directory and their associated metadata in `_data/photos.json` are licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0). See [LICENSE-PHOTOS](LICENSE-PHOTOS) for more details.
