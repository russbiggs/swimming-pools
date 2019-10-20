const canvas = document.body.querySelector('canvas');
const context = canvas.getContext('2d');
const tree = new rbush();

function boundingBox(feature) {
    let bounds= {};
    let coords = feature.geometry.coordinates[0];
    for (let i = 0; i < coords.length; i++) {
        let longitude = coords[i][0];
        let latitude = coords[i][1];
        bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
        bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
        bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
        bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
    }
    bounds.xMin = project(bounds.xMin,bounds.yMin).x;
    bounds.yMin = project(bounds.xMin,bounds.yMin).y;
    bounds.xMax = project(bounds.xMax,bounds.yMax).x;
    bounds.yMax = project(bounds.xMax,bounds.yMax).y;
    return bounds;
}

function drawFeature(offsetX , offsetY, feature) {
    context.fillStyle = '#74d4de';
    const bounds = boundingBox(feature);
    const xScale = 50 / Math.abs(bounds.xMax - bounds.xMin);
    const yScale = 50 / Math.abs(bounds.yMax - bounds.yMin);
    const scale = (xScale < yScale ? xScale : yScale) - 0.1;
    const coords = feature.geometry.coordinates[0];
    for (let i = 0; i < coords.length; i++) {
        const longitude = coords[i][0];
        const latitude = coords[i][1];
        let point = project(longitude, latitude);
        point = {
            x: (point.x - bounds.xMin) * scale + offsetX,
            y: (bounds.yMax - point.y) * scale + offsetY
        };
        if (i === 0) {
            context.beginPath();
            context.moveTo(point.x, point.y);
        } else {
            context.lineTo(point.x, point.y);
        }
    }
    context.fill();
}

function project(longitude, latitude) {
    /* project into mercator */
    const radius = 6378137;
    const max = 85.0511287798;
    const radians = Math.PI / 180;
    let point = {x:0,y:0};
    point.x = radius * longitude * radians;
    point.y = Math.max(Math.min(max, latitude), -max) * radians;
    point.y = radius * Math.log(Math.tan((Math.PI / 4) + (point.y / 2)));
    return point;
}

function getWidth() {
    return Math.min(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

fetch('./pools.json').then(res=> {
    return res.json();
}).then((topo)=>{
    const data = topojson.feature(topo, topo.objects.pools);
    draw(data,tree);
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(draw(data,tree), 300);
    });
})

function draw(data, tree){
    tree.clear();
    context.clearRect(0, 0, canvas.width, canvas.height);
    const featureLength = data.features.length;
    const width = getWidth();
    const rowWidth = Math.floor( width / 50);
    canvas.height = Math.ceil((((featureLength / rowWidth) * 50)- 1)/ 50) * 50;
    canvas.width = Math.ceil((width-1)/50) * 50 - 50;
    let offsetX = 0;
    let offsetY = 0;
    let boxArr = [];
    
    for (let i = 0; i < featureLength; i++) {
        const feature =  data.features[i]
        drawFeature(offsetX, offsetY,  feature);
        let box = {
            featureId: feature.properties['@id'],
            minX :offsetX,
            minY :offsetY,
            maxX :offsetX + 50,
            maxY :offsetY + 50
        }
        offsetX += 50;
        if (offsetX % canvas.width == 0) {
            offsetX = 0;
            offsetY += 50;
        }
        boxArr.push(box)
    }
    tree.load(boxArr);
    canvas.removeEventListener('click',openFeature);
    canvas.addEventListener('click', openFeature);
}

function openFeature(e) {
    const x = e.pageX;
    const y = e.pageY;
    const cells = tree.search({
        minX: x,
        minY: y,
        maxX: x + 1,
        maxY: y + 1
    });
    window.open('https://openstreetmap.org/' + cells[0].featureId, '_blank');
}