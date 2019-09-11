/**
 * Copyright 2019 Jim Armstrong (www.algorithmist.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CanvasContainerDirective } from './directives/canvas-container.directive';

import { Marker } from './marker/Marker';

/**
 * Main App component that serves as an interactive testbed for the Typescript Math Toolkit Cubic Bezier Spline
 *
 * Author Jim Armstrong (www.algorithmist.net)
 *
 * Version 1.0
 *
 */
import {
  Component,
  OnInit,
  ViewChild
} from '@angular/core';

import { IMarkerSubscriber } from './marker/Marker';

import { TSMT$CubicBezierSpline } from './libs/CubicBezierSpline';
import { TSMT$CubicBezier } from './libs/CubicBezier';

import * as PIXI from 'pixi.js/dist/pixi.js';
import InteractionEvent = PIXI.interaction.InteractionEvent;

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit
{
  public static MAX_KNOTS: number = 8;                     // Maximum allowable number of knots or interpolations points
  protected static BEZIER_LINE_COLOR: number = 0x0000ff;   // Draw the cubic bezier spline with this color

  public statusTxt: string = '';                           // display status/instructions

  // Canvas
  @ViewChild(CanvasContainerDirective, {static: true})
  _canvas: CanvasContainerDirective;

  protected _width: number    = 0;                         // Canvas width
  protected _height: number   = 0;                         // Canvas height
  protected _numKnots: number = 0;                         // # knots or interpolation points

  protected _markers: Array<Marker>;                       // Marker collection

  // Stage and Marker handlers
  protected _onStageMouseClick: InteractionEvent;
  protected _onMarkerMoved: IMarkerSubscriber;

  // PixiJS
  protected _stage: PIXI.Container;
  protected _splineGraphics: PIXI.Graphics;                // draw the cubic spline
  protected _markerContainer: PIXI.Container;              // overlay Markers on top of spline

  // The cubic spline
  protected _spline: TSMT$CubicBezierSpline;

  constructor()
  {
    this._onStageMouseClick = (evt: any) => this.__onStageClicked(evt);
    this._onMarkerMoved     = (id: string, x: number, y: number) => this.__onMarkerMoved(id, x, y);


    this._spline = new TSMT$CubicBezierSpline();

    this.onClear();
  }

  /**
   * Angular lifecycle - on init
   */
  public ngOnInit(): void
  {
    if (this._canvas !== undefined)
    {
      this._stage  = this._canvas.stage;
      this._width  = this._canvas.width;
      this._height = this._canvas.height;

      this.__setup();
    }
  }

  /**
   * Clear the drawing area and prepare to input new knots
   */
  public onClear(): void
  {
    if (this._markers !== undefined && this._markers.length > 0)
    {
      this._markers.forEach((marker: Marker): void => {
        marker.clear();
      });
    }

    if (this._markerContainer !== undefined) {
      this._markerContainer.removeChildren();
    }

    if (this._stage !== undefined)
    {
      // sanity check on duplicate listeners
      this._stage.removeAllListeners();

      // Stage pointer-up events
      this._stage.on('pointerup', this._onStageMouseClick);
    }

    if (this._spline !== undefined) {
      this._spline.clear();
    }

    if (this._splineGraphics !== undefined) {
      this._splineGraphics.clear();
    }

    this._markers  = new Array<Marker>();
    this._numKnots = 0;
    this.statusTxt = "'Click' to add knots.  'Draw' to draw cubic spline";
  }

  /**
   * Compute and draw the cubic spline
   */
  public onDraw(): void
  {
    if (this._numKnots < 3)
    {
      // Two points degenerates into a straight line
      this.statusTxt = 'You must define at least three knots';
    }
    else
    {
      this._stage.removeAllListeners();

      this._markers.forEach((marker: Marker): void => {
        marker.addSubscriber(this._onMarkerMoved);
      });

      this.statusTxt = "'Clear' to reset for another spline.";

      this.__drawSpline();
    }
  }

  // draw the spline using the current marker set
  protected __drawSpline(): void
  {
    // Provide the marker coordinates to the cubic spline
    let i: number;
    let marker: Marker;
    for (i = 0; i < this._markers.length; ++i)
    {
      marker = this._markers[i];

      this._spline.addControlPoint(marker.x, marker.y);
    }

    // draw the spline; each segment is a single cubic bezier and there are n-1 segments, where n is the number of knots
    const n: number = this._numKnots-1;
    let bezier: TSMT$CubicBezier;

    this._splineGraphics.clear();
    this._splineGraphics.lineStyle(2, AppComponent.BEZIER_LINE_COLOR, 1);

    for (i = 0; i < n; ++i)
    {
      bezier = this._spline.getCubicSegment(i);

      this._splineGraphics.moveTo(bezier.x0, bezier.y0);
      this._splineGraphics.bezierCurveTo(bezier.cx, bezier.cy, bezier.cx1, bezier.cy1, bezier.x1, bezier.y1);
    }
  }

  // Complete drawing environment setup
  protected __setup(): void
  {
    // spline and marker containers
    this._markerContainer = new PIXI.Container();
    this._splineGraphics  = new PIXI.Graphics();

    this._stage.addChild(this._splineGraphics);
    this._stage.addChild(this._markerContainer);

    this._stage.interactive = true;
    this._stage.hitArea     = new PIXI.Rectangle(0, 0, this._width, this._height);
    this._stage.on('click', this._onStageMouseClick);
  }

  // Execute for clicks in stage area
  protected __onStageClicked(evt: any): void
  {
    let marker: Marker;
    let markerShape: PIXI.Graphics;

    if (this._numKnots < AppComponent.MAX_KNOTS)
    {
      marker      = new Marker();
      markerShape = marker.create();

      marker.setCoords(evt.data.global.x, evt.data.global.y);

      this._markers.push(marker);

      this._markerContainer.addChild(markerShape);

      this._numKnots++;

      this.statusTxt = `Total knot count ${this._numKnots}`;
    } else
    {
      this.statusTxt = 'Knot limit exceeded.  Clear Canvas and try a new knot set.';
    }
  }

  // Execute whenever a marker is moved
  protected __onMarkerMoved(id: string, x: number, y: number): void
  {
    // It's possible to create a strategy that only modifies the sections of spline control affected by the
    // single control point.  For purposes of simplicity and ease of deconstruction, the entire spline is
    // re-computed and re-drawn.  This handler is decoupled from the spline drawing so that you can modify
    // the demo for many different purposes.  The Marker's id (representing the index of the Marker in a
    // collection) and new (x,y) coordinates are provided in the callback.

    this._spline.clear();
    this.__drawSpline();
  }
}
