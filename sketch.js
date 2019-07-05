let current_AR = {
	max_x: 2.5,
	max_y: 2.5,
	min_x: -2.5,
	min_y: -2.5
};

let desired_AR = {
	max_x: 2.5,
	max_y: 2.5,
	min_x: -2.5,
	min_y: -2.5
}

const TIME = 10000;
let start_time = (new Date()).getTime();

let start;

let minSlider,maxSlider;

function setup() {
	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	colorMode(HSB,100);
}

function draw() {
	draw_histo();
}

function hsv_to_rgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}

function draw_histo() {
	let ar;
	let d = new Date();
	if (d.getTime() - start_time < TIME) {
		ar = {
			min_x: map(d.getTime() - start_time, 0, TIME, current_AR.min_x, desired_AR.min_x),
			max_x: map(d.getTime() - start_time, 0, TIME, current_AR.max_x, desired_AR.max_x),
			min_y: map(d.getTime() - start_time, 0, TIME, current_AR.min_y, desired_AR.min_y),
			max_y: map(d.getTime() - start_time, 0, TIME, current_AR.max_y, desired_AR.max_y)
		};
	} else {
		current_AR = {
			min_x: desired_AR.min_x,
			max_x: desired_AR.max_x,
			min_y: desired_AR.min_y,
			max_y: desired_AR.max_y
		};
		ar = current_AR;
	}

	let maxiterations = 100;
	let iteration_count = [];
	let num_iterations_per_pixel = new Array(maxiterations + 1).fill(0);
	loadPixels();
	//counts the number of iterations for each pixel
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {

			let a = map(x,0,width,ar.min_x,ar.max_x);
			let b = map(y,0,height,ar.min_y,ar.max_y);
			let ca = a;
			let cb = b;

			let n = 0;
			while (n < maxiterations) {
				let aa = a*a - b*b;
				let bb = 2 * a * b;
				a = aa + ca;
				b = bb + cb;
				if (abs(a + b) > 16) {
					break;
				}
				n++;
			}
			iteration_count[x + y * width] = n;
		}
	}

	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			let i = iteration_count[x + y * width];
			num_iterations_per_pixel[i]++;
		}
	}
	let total = num_iterations_per_pixel.reduce((t,c,i,arr) => t + c, 0);
	let hue = new Array(width * height).fill(0.0);
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			iteration = iteration_count[x + y*width];
			for (let i = 0; i <= iteration; i++) {
				hue[x + y*width] += num_iterations_per_pixel[i];
			}
			hue[x + y*width] /= total;
			let rgb_color = hsv_to_rgb(hue[x+y*width],1,.5);
			let pix = (x + y * width) * 4;
			pixels[pix + 0] = rgb_color[0];
			pixels[pix + 1] = rgb_color[1];
			pixels[pix + 2] = rgb_color[2];
			pixels[pix + 3] = 255;
		}
	}

	updatePixels();
}

function mousePressed() {
	start = {x: mouseX, y: mouseY};
}

function mouseReleased() {
	let ll = {x: min(start.x, mouseX), y: min(start.y, mouseY)};
	let ur = {x: max(start.x, mouseX), y: max(start.y, mouseY)};
	let new_min_x = map(ll.x, 0,width, current_AR.min_x, current_AR.max_x);
	let new_max_x = map(ur.x, 0,width, current_AR.min_x, current_AR.max_x);
	let new_min_y = map(ll.y, 0,height, current_AR.min_y, current_AR.max_y);
	let new_max_y = map(ur.y, 0,height, current_AR.min_y, current_AR.max_y);

	desired_AR.max_x = new_max_x;
	desired_AR.min_x = new_min_x;
	desired_AR.max_y = new_max_y;
	desired_AR.min_y = new_min_y;

	start_time = (new Date()).getTime();
}
