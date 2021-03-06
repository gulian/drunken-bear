var crypto = require('crypto'),
	key    = 'drunk3n-b34r-r0ck5';

exports.index = function(req, res){
	if(!req.session.authenticated)
		return res.redirect('login');

	res.render('index', {session: req.session});
};


exports.register = function(req, res){

	if(req.method !== 'POST')
		return res.render('register');

	req.mongoose.models.user.find({username:req.body.username},function(error, users){
		if(error || users.length > 0)
			return res.render('register', {message:"this username is already taken, please choose another one !"});

		req.body.password = crypto.createHmac('sha1', key).update(req.body.password).digest('hex');

		new req.mongoose.models.user(req.body).save(function (error, user) {
			if (error)
				return res.send(500);

			req.session.authenticated = true;
			req.session.username      = user.username;
			req.session._id           = user._id;

			return res.redirect('/');
		});
	});
};

exports.login = function(req, res){
	if(req.session.authenticated)
		return res.redirect('/');

	if(req.method !== 'POST')
		return res.render('login');

	req.mongoose.models.user.findOne({username:req.body.username},function(error, user){
		if(error || !user || crypto.createHmac('sha1', key).update(req.body.password).digest('hex') !== user.password)
			return res.render('login', {message:"there is something wrong in your credentials"});

		req.session.authenticated = true;
		req.session.username      = user.username;
		req.session._id           = user._id;

		return res.redirect('/');
	});
};

exports.logout = function(req, res){
	req.session.destroy();
	res.redirect('/');
};
