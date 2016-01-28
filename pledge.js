'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

var $Promise = function(){
	this.state = 'pending';
	this.handlerGroups = [];
};

$Promise.prototype.then = function( successCb, errorCb){	
		if (typeof successCb != 'function') successCb = null;
		if (typeof errorCb != 'function') errorCb = null;

		var newDeferral = new Deferral();
		this.handlerGroups.push({successCb:successCb, errorCb:errorCb, forwarder: newDeferral});

		if(this.state !== "pending"){
			this.callHandlers(this.value);
		}
		return newDeferral.$promise;
	};

$Promise.prototype.callHandlers = function(value){
	var handler, newDeferral, newValue;
	var currentHandlers; 
	while(this.handlerGroups.length && this.state !== 'pending'){
		currentHandlers = this.handlerGroups[0];
		if(this.state === 'resolved') handler = currentHandlers.successCb;
		if(this.state === 'rejected') handler = currentHandlers.errorCb;

		newDeferral = currentHandlers.forwarder;
		//newDeferral.$promise.handlerGroups = this.handlerGroups;
		this.handlerGroups.shift();

		if(handler) {
			try{
				newValue = handler(value) || value;
				//If handler returns a promise!!:
				if(newValue instanceof $Promise){
					 newValue.then(function(value){
					 	newDeferral.resolve(value);
					 });
				}else{
					newDeferral.resolve(newValue);
				}
			} catch(e){
				newDeferral.reject(e);
			}
		} else { 
			newValue = value; 
			if(this.state === 'rejected') newDeferral.reject(newValue);
			if(this.state === 'resolved') newDeferral.resolve(newValue);
		}

	}
	// 	console.log(newDeferral);
	// return newDeferral.$promise;
};

$Promise.prototype.catch = function(fn){
	return this.then(null,fn);
};

var Deferral = function(){
	this.$promise = new $Promise();
	this.resolve = function(data){
		if (this.$promise.state === 'pending'){
			this.$promise.value = data;
			this.$promise.state = 'resolved';
			this.$promise.callHandlers(data);
		}
	};
	this.reject = function(reason){
		if(this.$promise.state === 'pending'){
			this.$promise.value = reason;
			this.$promise.state = 'rejected';
			this.$promise.callHandlers(reason);
		}
	};
};

var defer = function(){
	return new Deferral();
};




/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
