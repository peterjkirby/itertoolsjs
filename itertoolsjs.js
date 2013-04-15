/*!
 * IterToolsJS JavaScript Library v0.1
 * http://itertoolsjs.com/
 *
 * Copyright 2013 Peter J. Kirby
 * Released under the MIT license
 * http://itertoolsjs.com/license
 *
 * Date: 2013-4-14
 */

var Iterator = function(){
	this.items = [];
	this.index = -1;
	this._initialize.apply(this, arguments);
};

Iterator.prototype = {
		
		length: null,
		
		_initialize: function(iterable){
			/*
			 * Most of the time, iterable will be an iterable... There are a few
			 * times when it wont be. For now, deal with it pretty please @TODO
			 * Handle situations where iterable is intended to be an object
			 * repeater
			 */
							
			if (typeof iterable === undefined){
				this.length = -1;
				return;
				
			} else if (typeof iterable == 'string'){
				this.outputType = 'string';
				this.items = iterable.split('');
			} else {
				this.items = this._objToArr(iterable);	
			}
			
			this.length = this.items.length;
		},
		
		each: function(callback){
			if(this.index == -1)
				this.index = 0;
			
			for (; this.index < length; this.index++) {
				callback(this.items[this.index], this.index, this.items);
			}   
		},
		
		_objToArr: function(iterable){
			var newObj = [];
			for(var i in iterable)
				newObj[i] = iterable[i];
			
			return newObj;
		},

		next: function(){
			if(this.index+1 >= this.items.length)
					return undefined;
			
			return this.items[++this.index];
		},
		
		reset: function(){
			this.index = -1;
		},
		
		previous: function(){		
			return this.items[--this.index];
		},
		
		splice: function(i, j){
			return this._copy(this.items).splice(i, j);
		},
		
		_copy: function(arr){
			var newArr = [];
			for(var item in arr){
				newArr[item] = arr[item];
			}
			return newArr;
		},
		
		get: function(i){
			return this.items[i];
		},
		
		items: function(){
			return this.items;
		},
		
		keys: function(){
			var rtn = [];
			for (var key in this.items){
				rtn.push(key);
			}
			return rtn;
		}		
};

var itertools = function(){
	this.version = 'v0.1';
};

itertools.prototype = {
		
	chain: function(iterables){
		/*
		 * Makes a list from the first iterable in iterables, and then proceeds
		 * to the next, until all iterables are exhausted. Call .next() to get
		 * next iterable.
		 */
		var items = [];	
		for (var i in iterables){
			for(var item in iterables[i]){
				items.push(iterables[i][item]);
			}
		}
		
		return new Iterator(items);
	},
	
	combinations: function(iterable, r){
		
		var iterator = new Iterator(iterable),
			results = [],
			k = 1;
		
		iterator.each(function(item, i){
			for (var j = k; j <= iterator.length-r+1; j++){
				results.push(item+iterator.splice(j, r-1));
			}
			k++;
		}, this);
		
		return results;		
	},
	
	compress: function(){
		
	},
	
	count: function(start, step){
		if (typeof start === 'undefined')
			start = 0;
		
		if (typeof step === 'undefined')
			step = 1;
		
		var iterator = new Iterator();
		iterator.items = start;
		
		iterator.next = function(){
			var rtnNum = this.items; // do I really want to place a counter
										// here?
			this.items += step;
			return rtnNum;
		};
		
		return iterator;		
	},
	
	cycle: function(iterable){
		var iterator = new Iterator(iterable, true);
		
		iterator.next = function(){
			if(this.index+1 >= this.items.length){
				this.reset();
			}
			
			return this.items[++this.index];
		};
		
		return iterator;
	},
	
	dropWhile: function(predicate, iterable){
		//@TODO
	},
	
	groupBy: function(){
		//@TODO
	},
	
	iFilter: function(predicate, iterable){
		if (typeof predicate === 'undefined')
			predicate = function(x){return Boolean(x)};
		
		var iterator = new Iterator(iterable);
		
		iterator.next =  function(){
						
			if(this.index+1 >= this.items.length)
				return undefined;
			
			var next_item;
			
			while(this.index+1 < this.items.length){
				next_item = this.items[++this.index];
				if (predicate(next_item)){
					return next_item;
				}
			}
			
			return undefined;
		};
		
		return iterator;
	},
	
	iFilterFalse: function(){
		//@TODO
	},
	
	iMap: function(){
		//@TODO
	},	
	
	iSlice: function(iterable, start_or_stop, stop, step){
		if (typeof step === 'undefined')
			step = 1;
		
		if (typeof start_or_stop === 'undefined' || start_or_stop === null)
			start_or_stop = -1;
		
		var iterator = new Iterator(iterable);
		
		if(typeof stop === 'undefined'){
			stop = start_or_stop;
			
			iterator.next = function(){
				if (this.index+1 >= this.items.length || this.index+1 >= stop)
					return undefined;
				
				return this.items[++this.index];
				
			}
		} else if (stop === null){
			iterator.index = start_or_stop-step;
			iterator.next = function(){
				if(this.index+1 >= this.items.length)
					return undefined;		
				
				this.index += step
				return this.items[this.index];
			};	
		} else {
			iterator.index = start_or_stop-step;
			iterator.next = function(){
				if (this.index+1 >= this.items.length || this.index+1 >= stop)
					return undefined;
					
				this.index += step;
				return this.items[this.index];
			};
		}
		
		return iterator;
	},
	
	iZip: function(){
		//@TODO
	},
	
	permutations: function(sequence){
		var isNumber = false,
			n = 0,
			results = [];
		
		if (typeof sequence == 'number'){
			sequence = sequence.toString();
			isNumber = true;
		}
		
		try{
			n = sequence.length;		
		} catch (e){
			throw "sequence is not permuable";
		}
			
		if (n == 0 || n == 1)
			return [sequence];
		
		this._permute(sequence.split('').sort(), 0, results);	
		
		for (var perm in results){
			results[perm] = results[perm].join('');
			if (isNumber)
				results[perm] = parseFloat(results[perm]);				
		}
		
		return results;
	},

	_permute: function(sequence, level, outArr){
	
		var l = sequence.length;
		var c = null;
		
		if (l == level){
			outArr.push(this._copy(sequence));
			return
		}
			
		for (var i = level; i < sequence.length; i++){
			if (c == sequence[i])
				continue;
			
			c = sequence[i];
			
			this.swap(level, i, sequence);
			this._permute(sequence, level+1, outArr);
		}
		for (var i = level; i < l-1; i++){
			sequence[i] = sequence[i+1];
		}
		sequence[l-1] = c;
	},
	
	product: function(){
		//@TODO
	},
	
	repeat: function(obj, times){
		if(typeof times === 'undefined')
			times = true;
		
		var iterator = new Iterator();
		// @TODO
		// Don't set items this way... Figure out better way to do this
		iterator.items = obj;
		if (times === true){
			iterator.next = function(){
				return this.items;
			}
			return iterator;
		}
		iterator.index = 0;
		
		iterator.next = function(){
			if (this.index >= times)
				return undefined;
			
			this.index++;
			return this.items;
		}
		
		return iterator;
	},
	
	starMap: function(fn, iterable){
		
		var iterator = new Iterator(iterable);
		
		iterator.next = function(){
			if (this.index+1 >= this.items.length)
				return undefined;

			return fn.apply(this, this.items[++this.index]);
		};
		
		return iterator;
	},
	
	takeWhile: function(predicate, iterable){
		
		var iterator = new Iterator(iterable);
		this.wasPredicateTrue = true; // starts true... probably not best to
										// do that
		
		iterator.next = function(){
			if (this.index+1 >= this.items.length && this.wasPredicateTrue)
				return undefined;
			
			var rtnVal = this.items[++this.index];
			
			if(predicate(rtnVal))
				return rtnVal;
			
			this.wasPredicateTrue = false;
		};
		
		return iterator;		
	},
	
	tee: function(iterable){
		//@TODO
	},
	
	swap: function(i, j, arr){
		var tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	},

	_copy: function(arr){
		var newArr = []
		for(var item in arr){
			newArr[item] = arr[item]
		}
		return newArr
	},

	_factorial: function(n){
		if (n == 0)
			return 1
		else
			return n * this._factorial(n - 1)		
	}
}