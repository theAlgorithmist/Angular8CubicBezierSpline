# Angular 8 and Typescript Math Toolkit Cubic Bezier Spline

This is the code distribution for the Medium Article, _[Cubic Bezier Splines With Angular 8 and PixiJS](https://medium.com/ngconf/cubic-bezier-splines-with-angular-8-and-pixijs-635b876c2473)_ .

This distribution includes the Typescript Math Toolkit cubic Bezier spline.  Spline construction and drawing are illustrated with an interactive Angular 8 demo that uses PIXI 4 for dynamic drawing.  The application allows a small number of interpolation points to be defined by clicking in the drawing area.  Click the 'Draw' button to compute and draw the cubic spline that smoothly interpolates these points.


Author:  Jim Armstrong - [The Algorithmist]

@algorithmist

theAlgorithmist [at] gmail [dot] com

Angular: 8.1.1

PIXI: 4.8.2

Angular CLI: 8.1.1

Typescript: 3.4.5

## Running the demo

The drawing area is represented in light blue.  Click anywhere in that area to define up to eight interpolation points, which are visually represented by colored circles.  

Drag one of the control points to see how the spline changes as a function of the control points.


The current cubic Bezier spline API (_src/app/libs/CubicBezierSpline.ts_) is summarized below.


```
get numPoints(): number
get points(): Array<IPoint>
get length(): number
getCubicSegment(i: number): TSMT$CubicBezier | null
addControlPoint(x: number, y: number): void
setData(x: Array<number>, y: Array<number>): void
set closed(isClosed: boolean)
clear(): void
getX(_t: number): number
getY(_t: number): number
getXPrime(_t: number): number
getYPrime(_t: number): number
getXAtS(_s: number): number
getYAtS(_s: number): number
getXPrimeAtS(_s: number): number
getYPrimeAtS(_s: number): number
```

Since numerical approximation is required for general arc-length parameterization as well as some of the internal computations, the code distribution also includes classes for numerical integration, bisection, and root finding.


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.


## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


License
----

Apache 2.0

**Free Software? Yeah, Homey plays that**

[//]: # (kudos http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

[The Algorithmist]: <http://algorithmist.net>
