itertoolsjs
===========

The following module functions all construct and return iterators. 
Some provide streams of infinite length, so they should only be accessed by functions 
or loops that truncate the stream.

itertools.chain(iterables)
---------------------------
Make an iterator that returns elements from the first iterable until 
it is exhausted, then proceeds to the next iterable, until all of the 
iterables are exhausted. Used for treating consecutive sequences as a single 
sequence. 
`iterables` should be an array of iterables.

    chain: function(iterables){
        var items = [];	
        for (var i in iterables){
		    for(var item in iterables[i]){
			    items.push(iterables[i][item]);
		    }
		}		
		return new Iterator(items);
	}

itertools.combinations(iterable, r)
-----------------------------------

Return r length subsequences of elements from the input iterable.

Combinations are emitted in lexicographic sort order. So, if the input iterable
is sorted, the combination will be produced in sorted order.

Elements are treated as unique based on their position, not on their value. 
So if the input elements are unique, there will be no repeat values in each combination.

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
        
itertools.count([start, step])
------------------------------
Make an iterator that returns evenly spaced values starting with n. Often used 
as an argument to imap() to generate consecutive data points. Also, used with
izip() to add sequence numbers. Equivalent to:

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

itertools.cycle(iterable)
-------------------------

Make an iterator returning elements from the iterable and saving a copy of each. 
When the iterable is exhausted, return elements from the saved copy. Repeats indefinitely. 

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
	
Note, this member of the toolkit may require significant auxiliary storage (depending on the length of the iterable).

itertools.dropWhile(predicate, iterable)
----------------------------------------

Make an iterator that drops elements from the iterable as long as the predicate
is true; afterwards, returns every element. Note, the iterator does not produce any 
output until the predicate first becomes false, so it may have a lengthy start-up time.

	dropWhile: function(predicate, iterable){
		//@TODO
	},
        
        
itertools.groupBy(iterable[, key])
----------------------------------

Make an iterator that returns consecutive keys and groups from the iterable. 
The key is a function computing a key value for each element. If not specified
or is None, key defaults to an identity function and returns the element unchanged. 
Generally, the iterable needs to already be sorted on the same key function.

The operation of groupby() is similar to the uniq filter in Unix. It generates 
a break or new group every time the value of the key function changes (which is 
why it is usually necessary to have sorted the data using the same key function). 
That behavior differs from SQL’s GROUP BY which aggregates common elements regardless 
of their input order.

The returned group is itself an iterator that shares the underlying iterable with 
groupby(). Because the source is shared, when the groupby() object is advanced, the 
previous group is no longer visible. So, if that data is needed later, it should be 
stored as a list.

	groupBy: function(){
		//@TODO
	},


itertools.iFilter(predicate, iterable)
--------------------------------------

Make an iterator that filters elements from iterable returning only those 
for which the predicate is True. If predicate is None, return the items that 
are true. 

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
	
itertools.iFilterFalse(predicate, iterable)
-------------------------------------------

Make an iterator that filters elements from iterable returning only
those for which the predicate is False. If predicate is None, return 
the items that are false. Equivalent to:

	iFilterFalse: function(){
		//@TODO
	},

itertools.iMap(function, *iterables)
------------------------------------
Make an iterator that computes the function using arguments from each of the iterables. If function is set to None, then imap() returns the arguments as a tuple. Like map() but stops when the shortest iterable is exhausted instead of filling in None for shorter iterables. The reason for the difference is that infinite iterator arguments are typically an error for map() (because the output is fully evaluated) but represent a common and useful way of supplying arguments to imap(). Equivalent to:

	iMap: function(){
		//@TODO
	},	
	
itertools.iSlice(iterable, stop)
itertools.iSlice(iterable, start, stop[, step])
Make an iterator that returns selected elements from the iterable. If start is non-zero, then elements from the iterable are skipped until start is reached. Afterward, elements are returned consecutively unless step is set higher than one which results in items being skipped. If stop is None, then iteration continues until the iterator is exhausted, if at all; otherwise, it stops at the specified position. Unlike regular slicing, islice() does not support negative values for start, stop, or step. Can be used to extract related fields from data where the internal structure has been flattened (for example, a multi-line report may list a name field on every third line). Equivalent to:

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
	
If start is None, then iteration starts at zero. If step is None, then the step defaults to one.

itertools.iZip(iterables)
-------------------------

Make an iterator that aggregates elements from each of the iterables. 
Like zip() except that it returns an iterator instead of a list. Used 
for lock-step iteration over several iterables at a time. 

	iZip: function(){
		//@TODO
	},
	

The left-to-right evaluation order of the iterables is guaranteed. This makes possible an idiom for clustering a data series into n-length groups using izip(*[iter(s)]*n).

izip() should only be used with unequal length inputs when you don’t care about trailing, unmatched values from the longer iterables. If those values are important, use izip_longest() instead.


itertools.permutations(iterable)
-------------------------------------
Return successive r length permutations of elements in the iterable.

If r is not specified or is None, then r defaults to the length of the
iterable and all possible full-length permutations are generated.

Permutations are emitted in lexicographic sort order. So, if the input
iterable is sorted, the permutation tuples will be produced in sorted order.

Elements are treated as unique based on their position, not on their value.
So if the input elements are unique, there will be no repeat values in each permutation.

	// This is an older piece of code... I'm reworking it now
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


itertools.product(*iterables[, repeat])
---------------------------------------

Cartesian product of input iterables.

Equivalent to nested for-loops in a generator expression. 
For example, product(A, B) returns the same as ((x,y) for x in A for y in B).

The nested loops cycle like an odometer with the rightmost 
element advancing on every iteration. This pattern creates 
a lexicographic ordering so that if the input’s iterables are 
sorted, the product tuples are emitted in sorted order.

To compute the product of an iterable with itself, specify the
number of repetitions with the optional repeat keyword argument.
For example, product(A, repeat=4) means the same as product(A, A, A, A).

This function is equivalent to the following code, except that
the actual implementation does not build up intermediate results in memory:

	product: function(){
		//@TODO
	},

itertools.repeat(object[, times])
---------------------------------

Make an iterator that returns object over and over again. Runs indefinitely unless the times argument is specified. Used as argument to imap() for invariant function parameters. Also used with izip() to create constant fields in a tuple record. Equivalent to:

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
	
A common use for repeat is to supply a stream of constant values to imap or zip:

itertools.starMap(function, iterable)
-------------------------------------

Make an iterator that computes the function using arguments
obtained from the iterable. Used instead of imap() when argument 
parameters are already grouped in tuples from a single iterable 
(the data has been “pre-zipped”). The difference between imap() and 
starmap() parallels the distinction between function(a,b) and function(*c).

	starMap: function(fn, iterable){
		
		var iterator = new Iterator(iterable);
		
		iterator.next = function(){
			if (this.index+1 >= this.items.length)
				return undefined;

			return fn.apply(this, this.items[++this.index]);
		};
		
		return iterator;
	},
	
itertools.takeWhile(predicate, iterable)
----------------------------------------

Make an iterator that returns elements from the iterable as long as the predicate is true.

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
	
itertools.tee(iterable[, n=2])
Return n independent iterators from a single iterable. Equivalent to:

	tee: function(iterable){
		//@TODO
	},
	
Once tee() has made a split, the original iterable should not be used 
anywhere else; otherwise, the iterable could get advanced without the
tee objects being informed.

This itertool may require significant auxiliary storage (depending on how 
much temporary data needs to be stored). In general, if one iterator uses 
most or all of the data before another iterator starts, it is faster to use 
list() instead of tee().
