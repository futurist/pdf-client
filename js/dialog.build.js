/*
 * Simple jQuery Dialog
 * https://github.com/filamentgroup/dialog
 *
 * Copyright (c) 2013 Filament Group, Inc.
 * Author: @scottjehl
 * Contributors: @johnbender
 * Licensed under the MIT, GPL licenses.
 */

window.jQuery = window.Zepto || window.jQuery || window.shoestring;

(function( w, $ ){
	w.componentNamespace = w.componentNamespace || w;

	var pluginName = "dialog", cl, ev,
		doc = w.document,
		docElem = doc.documentElement,
		body = doc.body,
		$html = $( docElem );

	var Dialog = w.componentNamespace.Dialog = function( element ){
		this.$el = $( element );
		this.$background = !this.$el.is( '[data-nobg]' ) ?
			$( doc.createElement('div') ).addClass( cl.bkgd ).appendTo( "body") :
			$( [] );
		this.hash = this.$el.attr( "id" ) + "-dialog";

		this.isOpen = false;
		this.positionMedia = this.$el.attr( 'data-set-position-media' );
		this.isTransparentBackground = this.$el.is( '[data-transbg]' );
	};

	Dialog.events = ev = {
		open: pluginName + "-open",
		opened: pluginName + "-opened",
		close: pluginName + "-close",
		closed: pluginName + "-closed"
	};

	Dialog.classes = cl = {
		open: pluginName + "-open",
		opened: pluginName + "-opened",
		content: pluginName + "-content",
		close: pluginName + "-close",
		closed: pluginName + "-closed",
		bkgd: pluginName + "-background",
		bkgdOpen: pluginName + "-background-open",
		bkgdTrans: pluginName + "-background-trans"
	};

	Dialog.prototype.isSetScrollPosition = function() {
		return !this.positionMedia ||
			( w.matchMedia && w.matchMedia( this.positionMedia ).matches );
	};

	Dialog.prototype.destroy = function() {
		this.$background.remove();
	};

	Dialog.prototype.open = function() {
		if( this.$background.length ) {
			this.$background[ 0 ].style.height = Math.max( docElem.scrollHeight, docElem.clientHeight ) + "px";
		}
		this.$el.addClass( cl.open );
		this.$background.addClass( cl.bkgdOpen );
		this._setBackgroundTransparency();

		if( this.isSetScrollPosition() ) {
			this.scroll = "pageYOffset" in w ? w.pageYOffset : ( docElem.scrollY || docElem.scrollTop || ( body && body.scrollY ) || 0 );
			this.$el[ 0 ].style.top = this.scroll + "px";
		} else {
			this.$el[ 0 ].style.top = '';
		}

		$html.addClass( cl.open );
		this.isOpen = true;

		//window.location.hash = this.hash;

		if( doc.activeElement ){
			this.focused = doc.activeElement;
		}
		this.$el[ 0 ].focus();

		this.$el.trigger( ev.opened );
	};

	Dialog.prototype._setBackgroundTransparency = function() {
		if( this.isTransparentBackground ){
			this.$background.addClass( cl.bkgdTrans );
		}
	};

	Dialog.prototype.close = function(){
		if( !this.isOpen ){
			return;
		}

		this.$el.removeClass( cl.open );

		this.$background.removeClass( cl.bkgdOpen );
		$html.removeClass( cl.open );

		if( this.focused ){
			this.focused.focus();
		}

		if( this.isSetScrollPosition() ) {
			w.scrollTo( 0, this.scroll );
		}

		this.isOpen = false;

		this.$el.trigger( ev.closed );
	};
}( this, window.jQuery ));

(function( w, $ ){
  var Dialog = w.componentNamespace.Dialog, doc = document;

	$.fn.dialog = function(){
		return this.each(function(){
			var $el = $( this ), dialog = new Dialog( this );

			$el.data( "instance", dialog );

			$el.addClass( Dialog.classes.content )
				.attr( "role", "dialog" )
				.attr( "tabindex", 0 )
				.bind( Dialog.events.open, function(){
					dialog.open();
				})
				.bind( Dialog.events.close, function(){
					dialog.close();
				})
				.bind( "click", function( e ){
					if( $( e.target ).is( "." + Dialog.classes.close ) ){
						//w.history.back();
						e.preventDefault();
					}
				});

			dialog.$background.bind( "click", function() {
				//w.history.back();
				dialog.close();
			});

			// close on hashchange if open (supports back button closure)
			$( w ).bind( "hashchange", function(){
				var hash = w.location.hash.replace( "#", "" );

				if( hash !== dialog.hash ){
					dialog.close();
				}
			});

				// close on escape key
				$( doc ).off().on( "keydown", function( e ){

					var isInput = false;
					var curElement = document.activeElement || document.querySelector(':focus');
					var curElementTagName = curElement && curElement.tagName.toUpperCase();
					if (curElementTagName === 'INPUT' ||
					    curElementTagName === 'TEXTAREA' ||
					    curElementTagName === 'SELECT') {

					  isInput = true;
					}

					if(isInput) return;

					if( e.which === 27 ){
						dialog.close();
					}
					if( e.which === 13 ){
						if(dialog.$el.is(':visible')){
							dialog.$el.find('a:last').click();
						}
						dialog.close();
					}

				});


			return;
			// open on matching a[href=#id] click
			$( doc ).bind( "click", function( e ){
	        var $matchingDialog, $a;

	        $a = $( e.target ).closest( "a" );

					if( !dialog.isOpen && $a.length && $a.attr( "href" ) ){
						e.preventDefault();
						var href = $a.attr( "href" );
						if( !href.match(/^[#.]/) ) return;
						// catch invalid selector exceptions
						try {
							$matchingDialog = $( href );
						} catch ( error ) {
							// TODO should check the type of exception, it's not clear how well
							//      the error name "SynatxError" is supported
							return;
						}

						if( $matchingDialog.length && $matchingDialog.is( $el ) ){
							$matchingDialog.trigger( Dialog.events.open );
							e.preventDefault();
						}
					}
				});


		});
	};

	// auto-init
	$(function(){
		$( ".dialog" ).dialog();
	});
}( this, window.jQuery ));
