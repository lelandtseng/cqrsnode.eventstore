var uuid = require('node-uuid');
var Tiny = require('tiny');

function Store(aggreName){
	this.aggreName  =   aggreName;
	this._snapshotsDB = null;
	this._eventsDB = null;
	var self = this;
	Tiny('dbs/'+aggreName+'_snapshotsDB.tiny',function(err,db){
		self._snapshotsDB = db;
	});

	Tiny('dbs/'+aggreName+'_eventsDB.tiny',function(err,db){
		self._eventsDB = db;
	});

}

Store.prototype = {
	getSnapshot:function(aggreId,num,callback){

		if(typeof arguments[1] == 'function'){
		callback = num;
		this._snapshotsDB.find({aggreId:aggreId})
		.desc('num')
		.limit(1)(function(err,rs){
			
			if(rs) rs = rs[0];
			callback(null,rs);
		})
		}else{
			this._snapshotsDB.find({aggreId:aggreId,num:num})
			.limit(1)(function(err,rs){
				callback(err,rs[0]);
			})
		}
	},
	findEvents:function(aggreId,snum,callback){
		this._eventsDB.find({aggreId:aggreId,snum:snum})
		.desc('num')(callback);
	},
	storeSnapshot:function(snapshot,callback){
		this._snapshotsDB.set(uuid.v4(),snapshot,function(err){
			callback(err,snapshot);
		})
	},
	storeEvent:function(e,callback){
		this._eventsDB.set(uuid.v4(),e,function(err){
			callback(err,e);
		})
	}
}

module.exports = Store;