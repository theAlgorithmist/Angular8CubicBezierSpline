/**
 * Copyright 2016 Jim Armstrong (www.algorithmist.net)
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
 * Angular Dev Toolkit. Directive to select a Canvas element and create an EaselJS stage is from that reference.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 *
 */

import * as PIXI from 'pixi.js/dist/pixi.js';

 // platform imports
 import { Directive
        , AfterViewInit
        , ElementRef
        } from '@angular/core';

 @Directive({
  selector: '.canvasContainer'
 })

 export class CanvasContainerDirective implements AfterViewInit
 {
   // static PIXI options
   protected static OPTIONS: Object = {
     backgroundColor: 0xebebeb,
     antialias: true
   };

   protected _container: HTMLDivElement;

   // PIXI app and stage references
   protected _app: PIXI.Application;
   protected _stage: PIXI.Container;
   protected _width: number;
   protected _height: number;

   constructor(private _elRef: ElementRef)
   {
     this._container = <HTMLDivElement> this._elRef.nativeElement;

     const options = Object.assign({width: this._container.clientWidth, height: this._container.clientHeight},
                     CanvasContainerDirective.OPTIONS);

     this._app = new PIXI.Application(options);

     this._container.appendChild(this._app.view);

     this._stage = this._app.stage;

     this._width  = this._app.view.width;
     this._height = this._app.view.height;
   }

   /**
    * Angular lifecycle event - on init
    */
   public ngAfterViewInit()
   {
     // reserved for future use
   }

  /**
   * Create a PixiJS stage from the HTML Canvas reference or return null if unable to create
   */
   public get stage(): PIXI.Stage | null
   {
     return this._stage;
   }

   public get width(): number
   {
     return this._width;
   }

   public get height(): number
   {
     return this._height;
   }

   public get interactionManager(): PIXI.InteractionManager
   {
     return this._app.renderer.plugins.interaction;
   }

 }
