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
		.desc('num')(function(err,result){
			if(err){
				callback(null,null);	
			}else{
				callback(err,result)	
			}	
		});
	},
	findEvents2:function(aggreId,start,limit,callback){
		var self = this;
		this.eventCount(aggreId,function(err,count){
		var p = count - start;
		if(p > 0){
			self._eventsDB.find({aggreId:aggreId,$or:{num:{$lte:p}}}).desc('num').limit(limit)(callback)
		}else{
			callback(null,[]);
		}
		});
	},
	eventCount:function(aggreId,callback){
		this._eventsDB.find({aggreId:aggreId}).desc('num').limit(1)(function(err,resoult){
			if(err) callback(err,0);
			 else if(!resoult){
				callback(null,0);	
			}else{
				callback(null,resoult[0].num+1)		
			}
		})
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
	},
	count:function(aggreId,callback){
		this._eventsDB.find({aggreId:aggreId})(function(err,rs){
			if(err){
				callback(null,0)	
			}else{
				callback(null,rs.length)
			}
		})	
	}
}

module.exports = Store;
