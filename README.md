# OSM Swimming Pools

A tiled display of every swimming pool in Albuquerque, New Mexico in OpenStreetMap. Click a pool to see it on Openstreetmap.org.


## Build your own copy 

requirements
* Node.js

1. Clone the repo 

```sh
git clone https://github.com/russbiggs/swimming-pools
```

2. Update the bounding box in ```query.txt``` to the area you wish to query. The order of coordinates follows the Overpass API specifications see [here](https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide#Bounding_box_clauses_.28.22bbox_query.22.2C_.22bounding_box_filter.22.29). 

3. install the required packages

```sh
npm install
```

4. Run the ```index.js``` script which will download from Overpass based on the query in ```query.txt```.

```sh
node index.js
```

This will download the data into a file named pools.geojson, then it will crunch that data down into TopoJSON for a smaller bundle to app. The TopoJSON is what is used by the application, the GeoJSON is available just as an artifact.

5. Build the application 

```sh
npm run build
```

6. Serve the application with your favorite local web server for local viewing or deploy on your preffered platform (s3, github pages, netlify etc.).

## Gotchas

This uses HTML canvas to allow faster rendering but HTML canvas does have maximum dimensions defined by browser see [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#maximum_canvas_size). The code is currently optimized for the Albuquerque dataset so that each pool is 40px X 40px. Adjust this value to match your dataset size.