var _ = require('lodash')
var Class = require('uberclass')
var google = require('googleapis')
var compute = google.compute('v1')

module.exports = Class.extend(
{
	init: function(options)
	{
		_.bindAll(this)
		process.env.GOOGLE_APPLICATION_CREDENTIALS = options.serviceAccountJSONKey
		this.projectId = options.projectId
		this.zone = options.zone
		this.apiLink = 'https://www.googleapis.com/compute/v1/projects/' + this.projectId + '/zones/' + this.zone + '/'
		this.startupScriptUrl = options.startupScriptUrl
		//Currently, test-image has modo_cl on it
		this.diskImageLink = 'https://www.googleapis.com/compute/v1/projects/ingenuitystudios/global/images/test-image'
	},

	start: function(callback)

	{
		// This method checks process.env.GOOGLE_APPLICATION_CREDENTIALS for
		// a valid service account credentials file (JSON obtainable from Dev Console)
		var that = this
		google.auth.getApplicationDefault(function (err, authClient)
		{
			if (err)
			{
				console.log('failed to get the default credentials: '+ String(err))
				callback(err)
				return
			}
			if (authClient.createScopedRequired && authClient.createScopedRequired())
			{
				authClient = authClient.createScoped(['https://www.googleapis.com/auth/compute'])
				that.auth = authClient
				callback()
			}
		})
	},

	addNode: function(name, callback)
	{
		var that = this
		//Check the Google REST API for the possible fields here. Don't believe their 'required fields'
		// claim and instead just follow either the scheme below, or a request as close as possible to
		// one made by the Google API explorer as it will complain about literally every field not present otherwise.
		compute.instances.insert(
			{
				project: this.projectId,
				zone: this.zone,
				auth: this.auth,
				resource:
				{
					name: name,
					machineType: this.apiLink + 'machineTypes/n1-standard-1',
					//Change the startup disk size here
					disks: [
					{
						//autoDelete: determines whether instance deletion means disk deletion
						autoDelete: true,
						type: 'PERSISTENT',
						boot: true,
						initializeParams:
						{
							diskSizeGb: 100,
							sourceImage: this.diskImageLink,
							diskType: this.apiLink + 'diskTypes/pd-standard'
						}
					}],
					networkInterfaces: [
					{
					network: 'https://www.googleapis.com/compute/v1/projects/ingenuitystudios/global/networks/default',
					accessConfigs: [
						{
							name: 'External NAT',
							type: 'ONE_TO_ONE_NAT'
						}
					]
					}],
					metadata:
					{
						items: [
						{
							//Use key: startup-script if value is just the script; startup-script-url if you're providing
							// The link to some script online
							key: 'startup-script-url',
							value: this.startupScriptUrl
						}]
					}
				}
			},function(err, data)
			{
				console.log(data)
				if (err)
					callback(err)
				if (data)
					that.waitForResponse(data.name, callback) // can take minutes
			})
	},

	// waitForResponse ensures that the callback is only executed once the operation is registered as DONE.
	// Calls to an instance before the operation is done could result in not-found errors.
	// id is the operation name: you get this from Google's response to a request.
	waitForResponse: function(id, callback)
	{
		var that = this
		function getOperations()
		{
			//console.log('still waiting')
			compute.zoneOperations.get(
			{
				project: that.projectId,
				zone: that.zone,
				operation: id,
				auth: that.auth
			}, function(err, data)
			{
				if (err)
					return callback(err)
				if ((data) && (data.status == 'DONE'))
					{
						return callback()
					}
				else
					setTimeout(getOperations, 5000)
			})
		}
		getOperations()
	},

	// delete is a very slow operation on Google's side. callback is only called once the instance is
	// sure to be deleted, so if it is not essential that the resource is deleted before the next
	// operation be wary of blocking with this function.
	deleteNode: function(name, callback)
	{
		var that = this
		compute.instances.delete(
			{
				instance: name,
				project: this.projectId,
				zone: this.zone,
				auth: this.auth

			}, function(err, data)
		{
			if (err)
				return callback(err)
			if (data)
				that.waitForResponse(data.name, callback)
		})
	},

	//Returns a list of instance objects; use instance.name to find out easily which each one is
	listNodes: function(options, callback)
	{
		compute.instances.list(
			{
				project: this.projectId,
				zone: this.zone,
				auth: this.auth
			}, function(err, data)
		{
			if (err)
			{
				callback(err)
			}
			var instanceList = data.items
			callback(null, instanceList)
		})
	},

	// Returns google's information literally
	getNode: function(name, callback)
	{
		compute.instances.get(
			{
				project: this.projectId,
				zone: this.zone,
				auth: this.auth,
				instance: name
			}, function(err, data)
		{
			callback(err, data)
		})
	}
//End of class
})

