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

/**
 * A {Marker} is a simple, circular display object that is rendered into a supplied container.  Use the {create} factory method to
 * create a new marker.  A single {Marker} is tied to a single class instance; subsequent calls to {create} create a completely new
 * Marker.  Markers are interactive and can be dragged.  Add a subscriber to react to user drags.<br/><br/>A {Marker} has an {id}
 * property that may be used as an index to record the {Marker's} position in a collection of {Markers}.<br/><br/>It is the caller's
 * responsibility to add the {Marker} to the display list and update the stage after user interaction.
 *
 * A Marker is created on top of EaselJS, which is a hard dependency
 *
 * @author Jim Armstrong (www.algorithmist.net)
 * 
 * @version 1.0
 */

import * as PIXI from 'pixi.js/dist/pixi.js';

import InteractionEvent = PIXI.interaction.InteractionEvent;

// Models for a PixiJS event and a subscriber to Marker updates
export interface IPixiEvent
{
  (evt: InteractionEvent): void;
}

export interface IMarkerSubscriber
{
  (id: string, x: number, y: number): void;
}

export class Marker
{
  public id: string;                                   // Marker id - you break it, you buy it

  protected _markerShape: PIXI.Graphics = null;        // direct reference to the marker shape

  // subscribers to marker interactive updates
  protected _subscribers: Array<IMarkerSubscriber>;

  // event handlers
  protected _mousedown: IPixiEvent;
  protected _touchstart: IPixiEvent;
  protected _mouseup: IPixiEvent;
  protected _mouseupoutside: IPixiEvent;
  protected _touchend: IPixiEvent;
  protected _touchendoutside: IPixiEvent;
  protected _mousemove: IPixiEvent;
  protected _touchmove: IPixiEvent;

 /**
  * Construct a new {Marker}.  Call the {create} method to create the {Marker} with specific properties and return
  * the graphic context.
  */
  constructor()
  {
    this._subscribers = new Array<IMarkerSubscriber>();
    this._markerShape = null;

    this._mousedown       = (evt: InteractionEvent) => this.__startDrag(evt);
    this._touchstart      = (evt: InteractionEvent) => this.__startDrag(evt);
    this._mouseup         = (evt: InteractionEvent) => this.__endDrag(evt);
    this._mouseupoutside  = (evt: InteractionEvent) => this.__endDrag(evt);
    this._touchend        = (evt: InteractionEvent) => this.__endDrag(evt);
    this._touchendoutside = (evt: InteractionEvent) => this.__endDrag(evt);
    this._mousemove       = (evt: InteractionEvent) => this.__dragging(evt);
    this._touchmove       = (evt: InteractionEvent) => this.__dragging(evt);
  }

 /**
  * Create a new Marker; this will simultaneously clear out any callbacks assigned to a previous instance
  *
  * @param radius Radius of the graph marker in pixels
  *
  * @param color Hex color code for the {Marker}
  */
  public create(radius: number=8, color: string="#ff3300"): PIXI.Graphics
  {
    if (this._markerShape !== null) {
      this.clear();
    }
    
    this._markerShape        = new PIXI.Graphics();
    this._markerShape.cursor = 'pointer';
    this._markerShape.clear();
    this._markerShape.beginFill(color);
    this._markerShape.drawCircle(0,0,radius);
    this._markerShape.endFill();
    
    this.__makeDraggable();

    return this._markerShape;
  }

  /**
   * Clear the Marker by removing all listeners and subscribers
   */
  public clear(): void
  {
    if (this._markerShape !== null)
    {
      this._markerShape.off( 'mousedown'      , this._mousedown);
      this._markerShape.off( 'touchstart'     , this._touchstart );
      this._markerShape.off( 'mouseup'        , this._mouseup );
      this._markerShape.off( 'mouseupoutside' , this._mouseupoutside );
      this._markerShape.off( 'touchend'       , this._touchend );
      this._markerShape.off( 'touchendoutside', this._touchendoutside );
      this._markerShape.off( 'mousemove'      , this._mousemove );
      this._markerShape.off( 'touchmove'      , this._touchmove );

      this._markerShape = null;
    }

    if (this._subscribers !== undefined && this._subscribers.length > 0) {
      this._subscribers.length = 0;
    }
  }
  
 /**
  * Access the current x-coordinate
  */
  public get x(): number
  {
    return this._markerShape.x;
  }

 /**
  * Access the current y-coordinate
  */
  public get y(): number
  {
    return this._markerShape.y;
  }

 /**
  * Assign the x-coordinate of the {Marker} in pixels relative to the parent {Container}
  *
  * @param value x-coordinate to place the {Marker}.
  */
  public set x(value: number)
  {
    if (this._markerShape != null) {
      this._markerShape.x = !isNaN(value) ? value : this._markerShape.x;
    }
  }
  
 /**
  * Assign the y-coordinate of the marker in pixels relative to the parent {Container}
  *
  * @param value y-coordinate to place the {Marker}.
  *
  */
  public set y(value: number)
  {
    if (this._markerShape != null) {
      this._markerShape.y = !isNaN(value) ? value : this._markerShape.y;
    }
  }

 /**
  * Assign x- and y-coordinates of the {Marker} in pixels relative to the parent {Container}
  *
  * @param value x-coordinate to place the {Marker}.
  *
  * @param value y-coordinate to place the {Marker}.
  */
  public setCoords(x: number, y: number)
  {
    if (this._markerShape != null)
    {
      this._markerShape.x = !isNaN(x) ? x : this._markerShape.x;
      this._markerShape.y = !isNaN(y) ? y : this._markerShape.y;
    }
  }

 /**
  * Add a subscriber to handle to interactive {Marker} movement
  *
  * @param {IMarkerSubscriber} subscriber Each subscriber will be called with the {Marker's} {id} property and
  * new x,y coordinates on drag.
  */
  public addSubscriber(subscriber: IMarkerSubscriber): void
  {
    if (subscriber !== undefined && subscriber != null) {
      this._subscribers.push(subscriber);
    }
  }

 /**
  * Make the Marker graphic context draggable
  *
  * @param {PIXI.Graphics} g Graphic context
  */
  protected __makeDraggable(): void
  {
    this._markerShape.pivot.set(0.5);

    this._markerShape.interactive = true;
    this._markerShape.dragging    = false;

    // todo - have not yet tested on touch device
    this._markerShape.on( 'mousedown', (evt: InteractionEvent) => this.__startDrag(evt) );
    this._markerShape.on( 'touchstart', (evt: InteractionEvent) => this.__startDrag(evt) );

    this._markerShape.on( 'mouseup', (evt: InteractionEvent) => this.__endDrag(evt) );
    this._markerShape.on( 'mouseupoutside', (evt: InteractionEvent) => this.__endDrag(evt) );
    this._markerShape.on( 'touchend', (evt: InteractionEvent) => this.__endDrag(evt) );
    this._markerShape.on( 'touchendoutside', (evt: InteractionEvent) => this.__endDrag(evt) );

    this._markerShape.on( 'mousemove', (evt: InteractionEvent) => this.__dragging(evt) );
    this._markerShape.on( 'touchmove', (evt: InteractionEvent) => this.__dragging(evt) );
  }

  // handle EaselJS press-move event
  protected __startDrag(evt: any): void
  {
    // You can also use the 'as' syntax, but us old-school C++ programmers like casts :)
    (<PIXI.Graphics> evt.currentTarget).dragging = true;
  }

 /**
  * Execute while dragging an interactive point indicator
  *
  * @param {PIXI.interaction.InteractionEvent} evt Event reference
  */
  protected __dragging(evt: InteractionEvent): void
  {
    const g: PIXI.Graphics = <PIXI.Graphics> evt.currentTarget;
    if (g !== undefined && g.dragging)
    {
      // update control point position
      g.x = evt.data.global.x;
      g.y = evt.data.global.y;

      // let all subscribers react to the update
      let len: number = this._subscribers.length;
      if (len > 0)
      {
        let i: number;

        for (i = 0; i < len; ++i) {
          this._subscribers[i](this.id, this._markerShape.x, this._markerShape.y);
        }
      }
    }
  }

 /**
  * Execute after drag complete
  *
  * @param {PIXI.interaction.InteractionEvent} evt Event reference
  */
  protected __endDrag(evt: InteractionEvent): void
  {
    const g: PIXI.Graphics = <PIXI.Graphics> evt.currentTarget;

    if (g !== undefined) {
      g.dragging = false;
    }
  }
}
