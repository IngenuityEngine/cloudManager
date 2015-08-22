// Vendor Modules
/////////////////////////
// var async = require('async')
var _ = require('lodash')
var Class = require('uberclass')


// Main Script
/////////////////////////
var CloudManager= module.exports = {


// Base class
Base: Class.extend({

	init: function()
	{
		_.bindAll(this)
	},

	start: function(options, callback)
	{
		this.options = options
		callback()
	},

	addNode: function(name, callback)
	{
		//Add a VM instance to the cloud
	},

	deleteNode: function(name, callback)
	{
		//delete an existing node from the cloud
	}

	listNodes: function(name, callback)
	{
		// list all the Nodes currently existing in the cloud
	}

	getNode: function(name, callback)
	{
		// Returns information about a specified node
	}

// end of class
}),


// Plugin Management
/////////////////////////
start: function(pluginName, options, callback)
{
	var CloudManager = new CloudManager.plugins[pluginName]()
	CloudManager.start(options, callback)
	return CloudManager
},

plugins: {},

addPlugin: function(pluginName, plugin)
{
	CloudManager.plugins[pluginName] = plugin
}


// end of module
}