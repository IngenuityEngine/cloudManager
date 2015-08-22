// Vendor Modules
/////////////////////////
// var _ = require('lodash')
var async = require('async')
var it = global.it
var describe = global.describe
var expect = require('expect')
var config = require('c:/dev/cloudManager/config.js')



var CloudManager = require('c:/dev/cloudManager/cloudManager.js')



describe('test/test_cloudManager.js', function()
{
// Each of these tests takes about 3-5 mins to run, as they wait until
// Google has confirmed the resources have been allocated
this.timeout(1000000)

it('should init', function()
{
	new CloudManager(config)
})

it('should set up', function(done)
{
	new CloudManager(config).start(done)
})

it('should add a Node', function(done)
{
	var cloudManager = new CloudManager(config)
	async.waterfall([
		function(callback)
		{
			cloudManager.start(callback)
		},
		function(callback)
		{
			cloudManager.addNode('addnodetest', callback)
		},
		function(callback)
		{
			cloudManager.getNode('addnodetest', function(err, data)
			{
				expect(err).to.not.be.ok
				expect(data).to.be.ok
				expect(data.name).to.equal('addnodetest')
				callback()
			})
		},
		function(callback)
		{
			cloudManager.deleteNode('addnodetest', function(err)
			{
				expect(err).to.not.be.ok
				callback()
			})
		}
	], done)
})

it('should delete a node', function(done)
{
	var cloudManager = new CloudManager(config)
	async.waterfall([
		function(callback)
		{
			cloudManager.start(callback)
		},
		function(callback)
		{
			cloudManager.addNode('deletenodetest', callback)
		},
		function(callback)
		{
			cloudManager.deleteNode('deletenodetest', function(err)
			{
				expect(err).to.not.be.ok
				callback()
			})
		},
		function(callback)
		{
			cloudManager.getNode('deletenodetest', function(err, data)
			{
				expect(err).to.be.ok
				expect(data).to.equal(null)
				callback()
			})
		},
	], done)
})

it('should list Nodes', function(done)
{
	var cloudManager = new CloudManager(config)
	async.waterfall([
		function(callback)
		{
			cloudManager.start(callback)
		},
		function(callback)
		{
			cloudManager.addNode('firstlistnode', function(){})
			cloudManager.addNode('secondlistnode', callback)
		},
		function(callback)
		{
			cloudManager.listNodes(null, function(err, data)
			{
				if (err)
					callback(err)
				expect(data.length).to.equal(2)
				callback()
			})
		},
		function(callback)
		{
			cloudManager.deleteNode('firstlistnode', function(){})
			cloudManager.deleteNode('secondlistnode', callback)
		}], done)
})

it('should get node info for a node', function(done)
{
	var cloudManager = new CloudManager(config)
	async.waterfall([
		function(callback)
		{
			cloudManager.start(callback)
		},
		function(callback)
		{
			cloudManager.addNode('infonode', callback)
		},
		function(callback)
		{
			cloudManager.getNode('infonode', function(err, data)
			{
				expect(err).to.not.be.ok
				expect(data).to.be.ok
				expect(data.name).to.equal('infonode')
				callback()
			})
		},
		function(callback)
		{
			cloudManager.deleteNode('infonode', callback)
		}], done)
})
})