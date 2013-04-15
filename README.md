itertoolsjs
===========

ItertoolsJs

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
When counting with floating point numbers, better accuracy can sometimes be achieved by substituting multiplicative code such as: (start + step * i for i in count()).

Changed in version 2.7: added step argument and allowed non-integer arguments.

itertools.cycle(iterable)
Make an iterator returning elements from the iterable and saving a copy of each. When the iterable is exhausted, return elements from the saved copy. Repeats indefinitely. Equivalent to:

def cycle(iterable):
    # cycle('ABCD') --> A B C D A B C D A B C D ...
    saved = []
    for element in iterable:
        yield element
        saved.append(element)
    while saved:
        for element in saved:
              yield element
Note, this member of the toolkit may require significant auxiliary storage (depending on the length of the iterable).

itertools.dropwhile(predicate, iterable)
Make an iterator that drops elements from the iterable as long as the predicate is true; afterwards, returns every element. Note, the iterator does not produce any output until the predicate first becomes false, so it may have a lengthy start-up time. Equivalent to:

def dropwhile(predicate, iterable):
    # dropwhile(lambda x: x<5, [1,4,6,4,1]) --> 6 4 1
    iterable = iter(iterable)
    for x in iterable:
        if not predicate(x):
            yield x
            break
    for x in iterable:
        yield x
itertools.groupby(iterable[, key])
Make an iterator that returns consecutive keys and groups from the iterable. The key is a function computing a key value for each element. If not specified or is None, key defaults to an identity function and returns the element unchanged. Generally, the iterable needs to already be sorted on the same key function.

The operation of groupby() is similar to the uniq filter in Unix. It generates a break or new group every time the value of the key function changes (which is why it is usually necessary to have sorted the data using the same key function). That behavior differs from SQL’s GROUP BY which aggregates common elements regardless of their input order.

The returned group is itself an iterator that shares the underlying iterable with groupby(). Because the source is shared, when the groupby() object is advanced, the previous group is no longer visible. So, if that data is needed later, it should be stored as a list:

groups = []
uniquekeys = []
data = sorted(data, key=keyfunc)
for k, g in groupby(data, keyfunc):
    groups.append(list(g))      # Store group iterator as a list
    uniquekeys.append(k)
groupby() is equivalent to:

class groupby(object):
    # [k for k, g in groupby('AAAABBBCCDAABBB')] --> A B C D A B
    # [list(g) for k, g in groupby('AAAABBBCCD')] --> AAAA BBB CC D
    def __init__(self, iterable, key=None):
        if key is None:
            key = lambda x: x
        self.keyfunc = key
        self.it = iter(iterable)
        self.tgtkey = self.currkey = self.currvalue = object()
    def __iter__(self):
        return self
    def next(self):
        while self.currkey == self.tgtkey:
            self.currvalue = next(self.it)    # Exit on StopIteration
            self.currkey = self.keyfunc(self.currvalue)
        self.tgtkey = self.currkey
        return (self.currkey, self._grouper(self.tgtkey))
    def _grouper(self, tgtkey):
        while self.currkey == tgtkey:
            yield self.currvalue
            self.currvalue = next(self.it)    # Exit on StopIteration
            self.currkey = self.keyfunc(self.currvalue)
New in version 2.4.

itertools.ifilter(predicate, iterable)
Make an iterator that filters elements from iterable returning only those for which the predicate is True. If predicate is None, return the items that are true. Equivalent to:

def ifilter(predicate, iterable):
    # ifilter(lambda x: x%2, range(10)) --> 1 3 5 7 9
    if predicate is None:
        predicate = bool
    for x in iterable:
        if predicate(x):
            yield x
itertools.ifilterfalse(predicate, iterable)
Make an iterator that filters elements from iterable returning only those for which the predicate is False. If predicate is None, return the items that are false. Equivalent to:

def ifilterfalse(predicate, iterable):
    # ifilterfalse(lambda x: x%2, range(10)) --> 0 2 4 6 8
    if predicate is None:
        predicate = bool
    for x in iterable:
        if not predicate(x):
            yield x
itertools.imap(function, *iterables)
Make an iterator that computes the function using arguments from each of the iterables. If function is set to None, then imap() returns the arguments as a tuple. Like map() but stops when the shortest iterable is exhausted instead of filling in None for shorter iterables. The reason for the difference is that infinite iterator arguments are typically an error for map() (because the output is fully evaluated) but represent a common and useful way of supplying arguments to imap(). Equivalent to:

def imap(function, *iterables):
    # imap(pow, (2,3,10), (5,2,3)) --> 32 9 1000
    iterables = map(iter, iterables)
    while True:
        args = [next(it) for it in iterables]
        if function is None:
            yield tuple(args)
        else:
            yield function(*args)
itertools.islice(iterable, stop)
itertools.islice(iterable, start, stop[, step])
Make an iterator that returns selected elements from the iterable. If start is non-zero, then elements from the iterable are skipped until start is reached. Afterward, elements are returned consecutively unless step is set higher than one which results in items being skipped. If stop is None, then iteration continues until the iterator is exhausted, if at all; otherwise, it stops at the specified position. Unlike regular slicing, islice() does not support negative values for start, stop, or step. Can be used to extract related fields from data where the internal structure has been flattened (for example, a multi-line report may list a name field on every third line). Equivalent to:

def islice(iterable, *args):
    # islice('ABCDEFG', 2) --> A B
    # islice('ABCDEFG', 2, 4) --> C D
    # islice('ABCDEFG', 2, None) --> C D E F G
    # islice('ABCDEFG', 0, None, 2) --> A C E G
    s = slice(*args)
    it = iter(xrange(s.start or 0, s.stop or sys.maxint, s.step or 1))
    nexti = next(it)
    for i, element in enumerate(iterable):
        if i == nexti:
            yield element
            nexti = next(it)
If start is None, then iteration starts at zero. If step is None, then the step defaults to one.

Changed in version 2.5: accept None values for default start and step.

itertools.izip(*iterables)
Make an iterator that aggregates elements from each of the iterables. Like zip() except that it returns an iterator instead of a list. Used for lock-step iteration over several iterables at a time. Equivalent to:

def izip(*iterables):
    # izip('ABCD', 'xy') --> Ax By
    iterators = map(iter, iterables)
    while iterators:
        yield tuple(map(next, iterators))
Changed in version 2.4: When no iterables are specified, returns a zero length iterator instead of raising a TypeError exception.

The left-to-right evaluation order of the iterables is guaranteed. This makes possible an idiom for clustering a data series into n-length groups using izip(*[iter(s)]*n).

izip() should only be used with unequal length inputs when you don’t care about trailing, unmatched values from the longer iterables. If those values are important, use izip_longest() instead.

itertools.izip_longest(*iterables[, fillvalue])
Make an iterator that aggregates elements from each of the iterables. If the iterables are of uneven length, missing values are filled-in with fillvalue. Iteration continues until the longest iterable is exhausted. Equivalent to:

class ZipExhausted(Exception):
    pass

def izip_longest(*args, **kwds):
    # izip_longest('ABCD', 'xy', fillvalue='-') --> Ax By C- D-
    fillvalue = kwds.get('fillvalue')
    counter = [len(args) - 1]
    def sentinel():
        if not counter[0]:
            raise ZipExhausted
        counter[0] -= 1
        yield fillvalue
    fillers = repeat(fillvalue)
    iterators = [chain(it, sentinel(), fillers) for it in args]
    try:
        while iterators:
            yield tuple(map(next, iterators))
    except ZipExhausted:
        pass
If one of the iterables is potentially infinite, then the izip_longest() function should be wrapped with something that limits the number of calls (for example islice() or takewhile()). If not specified, fillvalue defaults to None.

New in version 2.6.

itertools.permutations(iterable[, r])
Return successive r length permutations of elements in the iterable.

If r is not specified or is None, then r defaults to the length of the iterable and all possible full-length permutations are generated.

Permutations are emitted in lexicographic sort order. So, if the input iterable is sorted, the permutation tuples will be produced in sorted order.

Elements are treated as unique based on their position, not on their value. So if the input elements are unique, there will be no repeat values in each permutation.

Equivalent to:

def permutations(iterable, r=None):
    # permutations('ABCD', 2) --> AB AC AD BA BC BD CA CB CD DA DB DC
    # permutations(range(3)) --> 012 021 102 120 201 210
    pool = tuple(iterable)
    n = len(pool)
    r = n if r is None else r
    if r > n:
        return
    indices = range(n)
    cycles = range(n, n-r, -1)
    yield tuple(pool[i] for i in indices[:r])
    while n:
        for i in reversed(range(r)):
            cycles[i] -= 1
            if cycles[i] == 0:
                indices[i:] = indices[i+1:] + indices[i:i+1]
                cycles[i] = n - i
            else:
                j = cycles[i]
                indices[i], indices[-j] = indices[-j], indices[i]
                yield tuple(pool[i] for i in indices[:r])
                break
        else:
            return
The code for permutations() can be also expressed as a subsequence of product(), filtered to exclude entries with repeated elements (those from the same position in the input pool):

def permutations(iterable, r=None):
    pool = tuple(iterable)
    n = len(pool)
    r = n if r is None else r
    for indices in product(range(n), repeat=r):
        if len(set(indices)) == r:
            yield tuple(pool[i] for i in indices)
The number of items returned is n! / (n-r)! when 0 <= r <= n or zero when r > n.

New in version 2.6.

itertools.product(*iterables[, repeat])
Cartesian product of input iterables.

Equivalent to nested for-loops in a generator expression. For example, product(A, B) returns the same as ((x,y) for x in A for y in B).

The nested loops cycle like an odometer with the rightmost element advancing on every iteration. This pattern creates a lexicographic ordering so that if the input’s iterables are sorted, the product tuples are emitted in sorted order.

To compute the product of an iterable with itself, specify the number of repetitions with the optional repeat keyword argument. For example, product(A, repeat=4) means the same as product(A, A, A, A).

This function is equivalent to the following code, except that the actual implementation does not build up intermediate results in memory:

def product(*args, **kwds):
    # product('ABCD', 'xy') --> Ax Ay Bx By Cx Cy Dx Dy
    # product(range(2), repeat=3) --> 000 001 010 011 100 101 110 111
    pools = map(tuple, args) * kwds.get('repeat', 1)
    result = [[]]
    for pool in pools:
        result = [x+[y] for x in result for y in pool]
    for prod in result:
        yield tuple(prod)
New in version 2.6.

itertools.repeat(object[, times])
Make an iterator that returns object over and over again. Runs indefinitely unless the times argument is specified. Used as argument to imap() for invariant function parameters. Also used with izip() to create constant fields in a tuple record. Equivalent to:

def repeat(object, times=None):
    # repeat(10, 3) --> 10 10 10
    if times is None:
        while True:
            yield object
    else:
        for i in xrange(times):
            yield object
A common use for repeat is to supply a stream of constant values to imap or zip:

>>>
>>> list(imap(pow, xrange(10), repeat(2)))
[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
itertools.starmap(function, iterable)
Make an iterator that computes the function using arguments obtained from the iterable. Used instead of imap() when argument parameters are already grouped in tuples from a single iterable (the data has been “pre-zipped”). The difference between imap() and starmap() parallels the distinction between function(a,b) and function(*c). Equivalent to:

def starmap(function, iterable):
    # starmap(pow, [(2,5), (3,2), (10,3)]) --> 32 9 1000
    for args in iterable:
        yield function(*args)
Changed in version 2.6: Previously, starmap() required the function arguments to be tuples. Now, any iterable is allowed.

itertools.takewhile(predicate, iterable)
Make an iterator that returns elements from the iterable as long as the predicate is true. Equivalent to:

def takewhile(predicate, iterable):
    # takewhile(lambda x: x<5, [1,4,6,4,1]) --> 1 4
    for x in iterable:
        if predicate(x):
            yield x
        else:
            break
itertools.tee(iterable[, n=2])
Return n independent iterators from a single iterable. Equivalent to:

def tee(iterable, n=2):
    it = iter(iterable)
    deques = [collections.deque() for i in range(n)]
    def gen(mydeque):
        while True:
            if not mydeque:             # when the local deque is empty
                newval = next(it)       # fetch a new value and
                for d in deques:        # load it to all the deques
                    d.append(newval)
            yield mydeque.popleft()
    return tuple(gen(d) for d in deques)
Once tee() has made a split, the original iterable should not be used anywhere else; otherwise, the iterable could get advanced without the tee objects being informed.

This itertool may require significant auxiliary storage (depending on how much temporary data needs to be stored). In general, if one iterator uses most or all of the data before another iterator starts, it is faster to use list() instead of tee().
