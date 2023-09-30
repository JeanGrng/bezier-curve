let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 10;

canvas.style.border = "5px solid red";

let canvas_width = canvas.width;
let canvas_height = canvas.height;

let background = new Image();
background.src = "/Users/jgroe/Documents/Programmation/Javascript/BezierCurve/SignatureNB.png";

let points = [];
let omegas = [];
let r = 10;
let current_point_index = null;
let is_dragging = false;
let startX = 0;
let startY = 0; 
for (i=1;i<3;i++){
	points.push({ x: 30*i, y: 50, color:"grey"});
	omegas.push(1)
}
let mouseX = 0;
let mouseY = 0;

function factoriel(num) {
  if (num < 0) 
        return -1;
  else if (num == 0) 
      return 1;
  else {
      return (num * factoriel(num - 1));
  }
}

function binom(n,k) {
	return factoriel(n)/(factoriel(n-k)*factoriel(k));
}

let binoms = [];

for (var n = 0; n < 200; n++) {
	binoms.push([])
	for (var i = 0; i <= n; i++) {
		binoms[n].push(binom(n,i))
	}
}

class Poly{
	constructor(coeffs){
		this.coeffs = coeffs;
		this.deg = coeffs.length-1;
	}
	plus(other){
		let degMax = Math.max(this.deg,other.deg);
		let degMin = Math.min(this.deg, other.deg);
		let coeffs = []
		for (let i=0; i<=degMin; i++) {
			coeffs.push(this.coeffs[i]+other.coeffs[i]);
		}
		if (degMax === this.deg) {
			for (i=degMin+1;i<=degMax; i++) {
				coeffs.push(this.coeffs[i])
			}
		}
		else {
			for (i=degMin+1;i<=degMax; i++) {
				coeffs.push(other.coeffs[i])
			}
		}
		return new Poly(coeffs);
	}
	fois(other){
		let deg = this.deg + other.deg ;
		let coeffs = [];
		for (let i = 0; i <= deg; i++) {
			coeffs.push(0)
		}
		for (let i=0;i<=this.deg;i++){
			for (let j=0;j<=other.deg;j++){
				coeffs[i+j] += this.coeffs[i]*other.coeffs[j];
			}
		}
		return new Poly(coeffs);
	}
	puissance(n){
		if (n === 0) {
			return new Poly([1])
		}
		return this.fois(this.puissance(n-1));
	}
	foisConst(c){
		let coeffs = [];
		for (var i = 0; i <= this.deg; i++) {
			coeffs.push(c*this.coeffs[i]);
		}
		return new Poly(coeffs);
	}
	comp(other){
		let pol = new Poly([0])
		for (var i = 0; i <= this.deg; i++) {
			pol = pol.plus(other.puissance(i).foisConst(this.coeffs[i]))
		}
		return pol;
	}
	eval(t){
		let f = 0;
		for (var i = 0; i <= this.deg; i++) {
			f += this.coeffs[i] * t**i;
		}
		return f;
	}
}

function bernstein(i,m){
	let p = new Poly([0,1]).puissance(i);
	let q = new Poly([1,-1]).puissance(m-i);
	return p.fois(q.foisConst(binoms[m][i]));
}

function bezier(lpoints, lomegas) {
	let f = [new Poly([0]),new Poly([0])];
	let g = new Poly([0]);
	let n = lpoints.length-1;
	for (var i = 0; i <= n; i++) {
		f[0] = f[0].plus(bernstein(i,n)
					   .foisConst(lpoints[i].x*lomegas[i]));
		f[1] = f[1].plus(bernstein(i,n)
					   .foisConst(lpoints[i].y*lomegas[i]));
		g = g.plus(bernstein(i,n).foisConst(lomegas[i]));
	}
	return [f, g]; 
}

let is_mouse_in_point = function(x,y,point) {
	let point_left = point.x;
	let point_right = point.x + point.width;
	let point_top = point.y;
	let point_bottom = point.y + point.height;

	if ((x-point.x)**2+(y-point.y)**2 < (r*2)**2){
		return true;
	}
	return false;
}

let mouse_down = function(event) {
	event.preventDefault();

	startX = parseInt(event.clientX);
	startY = parseInt(event.clientY);

	let index = 0;
	for (let point of points) {
		if (is_mouse_in_point(startX, startY, point)) {
			current_point_index = index;
			is_dragging = true;
			return;
		}
		current_point_index = index;
		index ++;
	}
}

let mouse_up = function(event) {
	if (!is_dragging) {
		return;
	}

	event.preventDefault();
	is_dragging = false
}

let mouse_out = function(event) {
	if (!is_dragging) {
		return;
	}

	event.preventDefault();
	is_dragging = false
}

let mouse_move = function(event) {
	mouseX = parseInt(event.clientX);
	mouseY = parseInt(event.clientY);
	if (!is_dragging) {
		return
	}
	else {
		event.preventDefault();

		let dx = mouseX - startX;
		let dy = mouseY - startY;

		let current_point = points[current_point_index];
		current_point.x += dx;
		current_point.y += dy;

		draw();

		startX = mouseX;
		startY = mouseY; 

	}
}

function key_down(event) {
	let code = event.keyCode;

	if (code === 13){
		points.push({ x: canvas.width-10, y: canvas.height-10, color:"grey"});
		omegas.push(1)
		draw()
		return
	}

	let index = 0;
	for (let point of points) {
		if (is_mouse_in_point(mouseX, mouseY, point)) {

			if (code === 38){
				omegas[index] *= 2
			}
			if (code === 40){
				omegas[index] /= 2
			}		}
		current_point_index = index;
		index ++;
	}
	draw()
}	

canvas.onmousedown = mouse_down;
canvas.onmouseup = mouse_up;
canvas.onmouseout = mouse_out;
canvas.onmousemove = mouse_move;
canvas.focus()
canvas.onkeydown = key_down;
/* window.addEventListener('keydown',this.check,false);*/







let draw = function() { 
	
	var canvas_width = canvas.width;
	var canvas_height = canvas.height;
  
	var image_width = background.width;
	var image_height = background.height;

	if (image_width > canvas_width || image_height > canvas_height) {
		// Calculer le ratio pour redimensionner l'image
		var ratio = Math.min(canvas_width / image_width, canvas_height / image_height)/1.5;
		image_width *= ratio;
		image_height *= ratio;
	  }
  
	var start_x = (canvas_width - image_width) / 2;
	var start_y = (canvas_height - image_height) / 2;


	context.clearRect(0,0,canvas_width,canvas_height);
	context.fillStyle = "black";
	context.fillRect(0,0,canvas_width,canvas_height);

	context.drawImage(background, start_x, start_y, image_width, image_height);


	context.strokeStyle = "grey";
	context.lineWidth = 2;
	for (i=0;i<points.length-1;i++){
		context.beginPath();
		context.moveTo(points[i].x,points[i].y)
		context.lineTo(points[i+1].x,points[i+1].y)
		context.stroke()
	}
	for (let point of points) {
		context.fillStyle = point.color;
		context.beginPath();
		context.arc(point.x,point.y,r,0,2*Math.PI)
		context.closePath();

		context.fill();

	}
	let h = bezier(points, omegas);
	let f = h[0];
	let g = h[1];
	context.strokeStyle = "white";
	context.lineWidth = 5;
	context.beginPath();
	context.moveTo(f[0].eval(0)/g.eval(0),f[1].eval(0)/g.eval(0));
	for (var t = 0; t <= 1; t+=0.001) {		
		context.lineTo(f[0].eval(t)/g.eval(t),f[1].eval(t)/g.eval(t));
	}
	context.stroke()

	let fXtxt = f[0].coeffs[0].toString();
	for (var i = 1; i < f[0].deg; i++) {
		fXtxt += " + "+f[0].coeffs[i].toString()+"t^"+i.toString()
	}

	let fYtxt = f[1].coeffs[0].toString();
	for (var i = 1; i < f[1].deg; i++) {
		fYtxt += " + "+f[1].coeffs[i].toString()+"t^"+i.toString()
	}

	let gtxt = g.coeffs[0].toString();
	for (var i = 1; i < g.deg; i++) {
		gtxt += " + "+g.coeffs[i].toString()+"t^"+i.toString()
	}
	ptxt = ""
	for (var i = 1; i < points.length; i++) {
		ptxt += points[i].x.toString()+"+"+points[i].y.toString()+"j, "
	}
	otxt = ""
	for (var i = 1; i < points.length; i++) {
		ptxt += omegas[i].toString()+", "
	}
	console.log(ptxt)
	console.log(otxt)
}

draw();

// (x,y) = (300661 + -1248t^1 + 3696t^2 + -13420t^3 + 109395t^4 + -431640t^5 + 1677060t^6 + -5684976t^7 + 12075525t^8 + -14539580t^9 + 9419586t^10 + -2914560t^11, -150649 + 720t^1 + 4290t^2 + -17380t^3 + 8415t^4 + 73656t^5 + -41580t^6 + -933768t^7 + 3221460t^8 + -4229060t^9 + 2179452t^10 + -115476t^11)/(-154 + 0t^1 + 0t^2 + 0t^3 + 0t^4 + 0t^5 + 924t^6 + -5544t^7 + 13860t^8 + -16940t^9 + 9702t^10 + -1848t^11)
// 0: Object { x: 454, y: 315, color: "grey" }
// 1: Object { x: 350, y: 375, color: "grey" }
// 2: Object { x: 302, y: 500, color: "grey" }
// 3: Object { x: 249, y: 611, color: "grey" }
// 4: Object { x: 351, y: 646, color: "grey" }
// 5: Object { x: 444, y: 653, color: "grey" }
// 6: Object { x: 655, y: 419, color: "grey" }
// 7: Object { x: 584, y: 389, color: "grey" }
// 8: Object { x: 515, y: 405, color: "grey" }
// 9: Object { x: 388, y: 443, color: "grey" }
// 10: Object { x: 385, y: 511, color: "grey" }
// 11: Object { x: 586, y: 405, color: "grey" }
// 12: Object { x: 951, y: 396, color: "grey" }