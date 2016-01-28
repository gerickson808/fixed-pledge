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
		var newDeferral = new Deferral();
		var newGroup = {
			successCb: typeof successCb === 'function' ? successCb: null,
			errorCb: typeof errorCb === 'function' ? errorCb: null,
			forwarder: newDeferral
		}
		this.handlerGroups.push(newGroup);

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
		else handler = currentHandlers.errorCb;

		newDeferral = currentHandlers.forwarder;
		//newDeferral.$promise.handlerGroups = this.handlerGroups;
		this.handlerGroups.shift();

		if(!handler) {
			newValue = value; 
			if(this.state === 'rejected') newDeferral.reject(newValue);
			else newDeferral.resolve(newValue);
		} 
		else { 
			try{
				newValue = handler(value) || value;
				//If handler returns a promise!!:
				if(newValue instanceof $Promise){
					 	newDeferral.assimilate(newValue);
				}else newDeferral.resolve(newValue);
			} catch(e){
				newDeferral.reject(e);
			}
		}

	}
};



$Promise.prototype.catch = function(fn){
	return this.then(null,fn);
};

var Deferral = function(){
	this.$promise = new $Promise();
};

function settle(state, data){
	if(this.$promise.state !== 'pending') return;
		this.$promise.value = data;
		this.$promise.state = state;
		this.$promise.callHandlers(data);
}

Deferral.prototype.resolve = function(data){
	settle.call(this,'resolved', data);
	};
Deferral.prototype.reject = function(reason){
	settle.call(this,'rejected', reason);
	};

Deferral.prototype.assimilate = function(promise){
	promise.then(this.resolve.bind(this), this.reject.bind(this));
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
