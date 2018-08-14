$(function() {
	if($('#tracking').length > 0) {
		// select type of tracking list
		$('.nav').on('click', 'li:not(.active)', function(){
			$('.nav li').removeClass('active').addClass('pointer');
			$(this).addClass('active').removeClass('pointer');
			
			$('#no_series_error').addClass('hidden');
			
			var type = $(this).data('type');
			switch(type) {
				case 'all': {
					$('.row').removeClass('hidden');
				} break;
				
				case 'unseen': {
					$('.row.seen').addClass('hidden');
					$('.row:not(.seen)').removeClass('hidden');
				} break;
				
				case 'seen': {
					$('.row:not(.seen)').addClass('hidden');
					$('.row.seen').removeClass('hidden');
				} break;
			}
			
			if($('.row:not(.hidden)').length < 1)
				$('#no_series_error').removeClass('hidden');
		});
		
		// remove serie from tracking list
		$('button[data-remove]').click(function(){
			var sid = $(this).data('remove');
			var elm = $('.row[data-serie="'+sid+'"]');
			var title = elm.find('h4').text();
			
			$('#titleName').text(title);
			$('#stopTracking #confirm').data('del', sid);
			$('#stopTracking').modal();
		});
		
		$('#stopTracking').on('click', '#confirm', function(){
			var sid = $(this).data('del');
			$.post('/ajax/tracking', {delete: sid}, function(r){
				if(typeof(r) != "undefined" && r == "1")
					return $('.row[data-serie="'+sid+'"]').remove();
				
				alert("×©×’×™××”: ×œ× ×”×¦×œ×—× ×• ×œ×”×¡×™×¨ ××ª ×”×¡×“×¨×” ×ž×ž×¢×§×‘ ×”×¡×“×¨×•×ª ×©×œ×š.\n×× ×”×‘×¢×™×” × ×ž×©×›×ª, ×× × ×“×•×•×—/×™ ×œ× ×•.");
			});
		});
	}
	
	if($('#faq').length > 0) {
		$('.nav li a[data-cat]').click(function(){
			var id = $(this).data('cat');
			$('#jscontent').html('');
			$.get('/ajax/faq', {catID: id}, function(r) {
				$('#jscontent').append('<ul class="list-unstyled"></ul>');
				$.each(r, function(k, v) {
					$('#jscontent ul').append('<li><h4 data-qid="'+v.id+'">'+v.question+'</h4></li>');
				});
			}, 'json');
		});
		
		$('#jscontent').on('click', 'h4[data-qid]', function() {
			if($(this).data('expended') == true)
				return false;
			
			var id = $(this).data('qid');
			var elm = $(this);
			$.get('/ajax/faq', {qID: id}, function(r) {
				$('#jscontent h4[data-qid="'+id+'"]').after(r);
				$(elm).data('expended', true);
			});
		});
	}
	
	if($('#signup').length > 0) {
		$('#username input').blur(function(){
			var username = $(this).val();
			$.get('/ajax/signup', {username: username}, function(r) {
				if(r == '1') {
					$('#username').addClass('has-success').removeClass('has-error');
					$('#username i').addClass('fa-check').removeClass('fa-times');
				} else {
					$('#username').removeClass('has-success').addClass('has-error');
					$('#username i').addClass('fa-times').removeClass('fa-check');
				}
			});
		});
		
		$('#email input').blur(function(){
			var email = $(this).val();
			$.get('/ajax/signup', {email: email}, function(r) {
				if(r == '1') {
					$('#email').addClass('has-success').removeClass('has-error');
					$('#email i').addClass('fa-check').removeClass('fa-times');
				} else {
					$('#email').removeClass('has-success').addClass('has-error');
					$('#email i').addClass('fa-times').removeClass('fa-check');
				}
			});
		});
		
		$('#email2').on('paste', 'input', function(e) {
			e.preventDefault();
			alert('× × ×”×–×Ÿ ×›×ª×•×‘×ª ××™×ž×™×™×œ ×‘××•×¤×Ÿ ×™×“× ×™ ×œ×¦×•×¨×š ××™×ž×•×ª × ×›×•× ×•×ª ×›×ª×•×‘×ª ×”××™×ž×™×™×œ');
		});
	}
	
	if($('#seriesList').length > 0 && typeof load == 'number') {
		if(load == loaded) { // register event in case we loaded, load value.
			var isLoading = false;
			$(document).scroll(function(){
				if(typeof scrollMaxY == 'undefined')
					scrollMaxY = document.documentElement.scrollHeight - document.documentElement.clientHeight;
				
				if(scrollMaxY - scrollY > 600) // You should scroll some more..
					return;
				
				if(isLoading)
					return;
				
				isLoading = true;
				
				$.ajax({
					url: 'ajax/series',
					data: {loadMore: load, start: loaded, search: search},
					method: 'GET',
					dataType: 'html'
				}).done(function(r){
					isLoading = false;
					$('#seriesList .content').append(r);
					var newLoaded = $(r).find('img').length;
					loaded += newLoaded;
					
					if(newLoaded < load) // The fun is over, I'm scrolling out of here
						$(document).unbind('scroll');
				});
			});
		}
	}
	
	if($('#watchEpisode').length > 0) {
		$('[data-toggle="tooltip"]').tooltip();
		
		$('#warning button').click(function(){
			setCookie('warn_'+SID, true, 365);
			$('#warning').remove();
		});
		
		// load episodes list (user select a new season)
		$('#season li').click(function(e){ // load episode list by season
			e.preventDefault();
			if(season == $(this).data('season'))
				return;
			
			season = $(this).data('season'); // set current season
			$('#season li').removeClass('active');
			$(this).addClass('active');
			
			if(typeof window.history.pushState === 'function')
				window.history.pushState('','',$(this).children().attr('href'));
				
			$.get('/ajax/watch', {episodeList: SID, season: season}, function(r){
				$('#episode').html(r);
				$('[data-toggle="tooltip"]').tooltip();
			});
		});
		
		// load episode (user click on episode)
		$("#episode").on('click', 'li', function(e){
			e.preventDefault();
			episode = $(this).data('episode');
			$('#episode li').removeClass('active');
			$(this).addClass('active');
			return preLoad(true)
		});
	
		// initialize spinner
		$('#spinner').circleProgress({
			value: 0,
			startAngle: 4.695,
			size: 200,
			fill: '#95cc00',
			emptyFill: '#7a7a7a',
			animation: false
		});
		
		// Mark as watch button on season list
		$('#season li i').click(function(e){
			e.stopPropagation();
			var se = $(this).parent().data('season');
			return markWatched(SID, se);
		});
		
		// Mark as watch button on episode list
		$('#episode').on('click', 'li i', function(e){
			e.stopPropagation();
			var ep = $(this).parent().data('episode');
			return markWatched(SID, season, ep);
		});
		
		// Mark as watch button on episode (player)
		$('#markAS').click(function() {
			if(markWatched(SID, season, episode) !== false) {
				if($('#markAS i').hasClass('fa-eye') === true) {
					$('#markAS i').removeClass('fa-eye').addClass('fa-eye-slash');
					$('#markAS span').text('×¡×ž×Ÿ ×¤×¨×§ ×›×œ× × ×¦×¤×”');
				} else {
					$('#markAS i').removeClass('fa-eye-slash').addClass('fa-eye');
					$('#markAS span').text('×¡×ž×Ÿ ×¤×¨×§ ×›× ×¦×¤×”');
				}
			}
		});
		
		// Toggle Lights
		$('#lights').click(function() {
			return toggleLights();
		});
		
		// Report video - Show / Hide form
		$('#report').click(function() {
			if($('#reportVideo').hasClass('hidden')) {
				$('#reportVideo').removeClass('hidden');
				// auto scroll to form top when done
				$('html, body').animate({
					scrollTop: $('#reportVideo').offset().top
				}, 2000);
			} else
				$('#reportVideo').addClass('hidden');
		});
		
		// Send report
		$('#submitReport').click(function(e) {
			e.preventDefault();
			$(this).addClass('disabled');
			var msg = $('#report_message').val();
			$.post('/ajax/flag_video', {vid: VID, msg: msg}, function(r) {
				$('#reportVideo .content').prepend('<div class="alert alert-success">'+r+'</div>');
			});
		});
		
		// change lights to user default
		if(cinemaMode == true)
			toggleLights();
		
		// Rate Serie
		$('#watchEpisode .stars i').click(function(){			
			var rate = $(this).data('star');
			$.post('/ajax/rate', {SID: SID, rating: rate}, function(r) {
				$('#seMsg').remove();
				if(r.msg)
					$('#watchEpisode .stars').append("<p id=\"seMsg\">×©×’×™××” ×‘×“×™×¨×•×’ ×”×¡×“×¨×”: "+r.msg+"</p>");
				else {
					sRating = [r.rate, r.ratedby];
					setRating(sRating, '#watchEpisode');
					$('#watchEpisode .stars').append("<p id=\"seMsg\">×”×¡×“×¨×” ×“×•×¨×’×” ×‘×”×¦×œ×—×”!</p>");
				}
			}, 'json');
		});
		
		// Select new serie rating
		$('#watchEpisode .stars i').mouseover(function(){
			var star = $(this).data('star');
			$('#watchEpisode .stars i').each(function(index, elm) {
				if(index+1 <= star)
					$(elm).removeClass('fa-star-half-o fa-star-o').addClass('hover fa-star');
				else
					$(elm).removeClass('hover fa-star fa-star-half-o').addClass('fa-star-o');
			});
		});
		
		$('#watchEpisode .stars').mouseleave(function(){
			$('#player .stars i').removeClass('hover');
			return setRating(sRating, '#watchEpisode');
		});
		
		// Rate Video
		$('#player .stars i').click(function(){
			var rate = $(this).data('star');
			$.post('/ajax/rate', {VID: VID, rating: rate}, function(r) {
				$('#erMsg').remove();
				if(r.msg)
					$('#player .stars').append("<p id=\"erMsg\">×©×’×™××” ×‘×“×™×¨×•×’ ×”×¤×¨×§: "+r.msg+"</p>");
				else {
					rating = [r.rate, r.ratedby];
					setRating(rating, '#playyer');
					$('#player .stars').append("<p id=\"erMsg\">×”×¤×¨×§ ×“×•×¨×’ ×‘×”×¦×œ×—×”!</p>");
				}
			}, 'json');
		});
    
		// Select new episode rating
		$('#player .stars i').mouseover(function(){
			var star = $(this).data('star');
			$('#player .stars i').each(function(index, elm) {
				if(index+1 <= star)
					$(elm).removeClass('fa-star-half-o fa-star-o').addClass('hover fa-star');
				else
					$(elm).removeClass('hover fa-star fa-star-half-o').addClass('fa-star-o');
			});
		});
		
		$('#player .stars').mouseleave(function(){
			$('#player .stars i').removeClass('hover');
			return setRating(rating, '#player');
		});
		
		$('#loading').on('click', '#proceed', function(){
			$('#loading').addClass('hidden');
			$('#player').removeClass('hidden');
			
			var pos = localStorage.getItem('pos_'+VID);
			if(pos > 0) {
				$('#continue button:first-of-type').data('play', pos);
				$('#continue').modal();
			}
		});
		
		$('#continue').on('click', '#confirm', function(){
			var pos = $(this).data('play');	
			videojs.getPlayer('videojs').currentTime(pos);
		});
		
		// user browse to episode (/watch/SID/season/SEASON/episode/EPISODE) on first page load
		if(season.length > 0 && episode.length > 0)
			preLoad(false);
		
		function preLoad(fullLoad) {
			// Handle the pre loading screen (wait screen)
			// GET:
			// season => season number
			// episode => episode number
			// fullLoad => load all episode info? (true/false)
			
			$('#loading').removeClass('hidden');
			$('#loading h2').text('×˜×•×¢×Ÿ ××ª ×¢×•× ×” '+season+' ×¤×¨×§ '+episode);
			$('#player, #loading #afterLoad, #reportVideo').addClass('hidden');
			$('#loading .err, #reportVideo .alert').remove();
			$('#submitReport').removeClass('disabled'); // remove disabled class from report video submit button (if user submitted the form in some previous episode)
			
			var player = videojs.getPlayer('videojs');
			if(typeof player != 'undefined') {
				// save current time
				if(player.currentTime() < player.duration())
					localStorage.setItem('pos_'+VID, player.currentTime());
				
				// dispose previous player and create a new player
				videojs('videojs').dispose();
				$('#playerDiv').html('<video id="videojs" class="embed-responsive-item video-js vjs-big-play-centered"></video>');
			}
			
			$('#videojs').bind('contextmenu',function() { return false; }); // prevent right click (download button)
			
			// Let the server know that we're want to watch an episode
			$.post('/ajax/watch', {preWatch: true, SID: SID, season: season, ep: episode}, function() {})
			.done(function(r){
				// destroy counter if already defined
				if(typeof counter != 'undefined' && counter !== false)
					clearInterval(counter);
				
				return loadEpisode(fullLoad);
		}
	
		function loadEpisode(fullload, token, altAuth) {
			// loading episode, handle: player settings, server limits.
			// GET:
			// fullload => load all episode info? (true/false)
			// token	=> token created by preLoad function (undefined if user is donor)
			// RETURN:
			// false on failure

			if(episode < 0)
				return false;
			
			if(typeof(altAuth) === 'undefined')
				altAuth = false;
			
			$('#loading #txt').text('×ž×—×¤×© ×©×¨×ª ×¦×¤×™×™×” ×–×ž×™×Ÿ...').show();
			
			// Get vast id from server
			var vast = "";
			$.ajax({
				url: '/ajax/watch',
				method: 'POST',
				data: {vast: true},
				dataType: 'text'
			}).done(function(r){
				if(r.length > 0)
					vast = "https://an.facebook.com/v1/instream/vast.xml?placementid="+r+"&pageurl="+urldecode(window.location);
			});
			
			$.post('/ajax/watch',{watch: fullload, token: token, serie: SID, season: season, episode: episode, auth: altAuth, type: 'episode'},function(){},'json')
			.done(function(e) {
				VID = e.VID;
				
				// check for errors
				if(e.error) {
					$('#loading #spinner').addClass('hidden').after('<div class="err"><h3>×©×’×™××”!</h3>'+e.error+'</div>');
					$('#loading #waitTime').addClass('hidden');
					return false;
				}
				
				// fix for Dev Only!
				pos = e.url.indexOf('dev');
				if(pos > -1) {
					server = e.url.slice(0, pos);
					domain = e.url.substr(pos + 4);
					e.url = server+domain;
				}
				
				var quality = Object.keys(e.watch)[0];
				
				var dir = {watch: 'watch', down: 'download'};
				if(altAuth == true)
					dir = {watch: 'altWatch', down: 'altDownload'};
				
				// Test video
				$.ajax({
					url: "//" + e.url + "/"+dir.watch+"/episode/"+quality+"/" + VID + ".mp4?token=" + e.watch[quality] + "&time=" + e.time + "&uid=" + e.uid,
					method: 'HEAD',
					error: function(xhr) {
						var msg = '';
						switch(xhr.status) {
							case 0: msg = '×©×¨×ª ×”×¦×¤×™×” ××™× ×• ×–×ž×™×Ÿ. ×™×ª×›×Ÿ ×©×©×’×™××” ×–×• × ×’×¨×ž×” ×¢×§×‘ ×¢×•×ž×¡×™× ×—×¨×™×’×™× ×¢×œ ×©×¨×ª ×”×¦×¤×™×™×” ××• ×‘×¢×™×ª ×ª×§×©×•×¨×ª ×‘×™×Ÿ ×ž×—×©×‘×š ×œ×©×¨×ª ×”×¦×¤×™×™×”.<br />\
											× × ×‘×¦×¢/×™ ×¨×™×¢× ×•×Ÿ ×œ×“×£ ×–×” ×¢×œ ×ž× ×ª ×œ× ×¡×•×ª ×©× ×™×ª<br />\
											×œ×¦×¤×™×™×” ×‘×¢×•×ž×¡×™ ×”×©×¨×ª×™× <a href="/status">×œ×—×¦×• ×›××Ÿ</a>'; break;
											
							case 400: msg = '×”×“×¤×“×¤×Ÿ ×©×‘×¨×©×•×ª×š ××™× ×• ×©×•×œ×— ×¤×¨×˜×™× ×ž×–×”×™× ××•×“×•×ª×™×• ×œ×©×¨×ª ×”×¦×¤×™×™×” ×©×œ× ×•.<br />\
											× ×¡×”/×™ ×œ×‘×˜×œ ××ª ×ª×•×¡×¤×™ ×”×“×¤×“×¤×Ÿ ××• ×œ×—×œ×•×¤×™×Ÿ ×”×©×ª×ž×©/×™ ×‘×“×¤×“×¤×Ÿ ××—×¨'; break;
							
							// try call loadEpisode again with special parameter to ensure we get different auth.
							case 401: msg = '×‘×›×œ ×¦×¤×™×™×” ×‘×¤×¨×§ ×× ×• ×™×•×¦×¨×™× ×¢×‘×•×¨×š ×ž×–×”×” ×™×™×—×•×“×™. ×ž×–×”×” ×–×” ×¤×’ ×ª×•×§×£ ××• ×©××™× ×• × ×™×ª×Ÿ ×œ××™×ž×•×ª.<br />\
											×‘×¦×¢/×™ ×¨×™×¢× ×•×Ÿ ×œ×“×£ ×–×” ×¢×œ ×ž× ×ª ×œ×™×¦×•×¨ ×ž×–×”×” ×—×“×©.<br />\
											×©×’×™××” ×–×• ×¢×œ×•×œ×” ×œ×”×ª×¨×—×© ×× ×›×ª×•×‘×ª ×”-IP ×©×œ×š ×”×ª×—×œ×¤×” ×œ××—×¨ ×™×¦×™×¨×ª ×”×ž×–×”×” ×”×™×™×—×•×“×™.<br />\
											×•×•×“×/×™ ×©××™× ×š ×’×•×œ×© ×ž××—×•×¨×™ Proxy / NAT ×”×ž×—×œ×™×£ ×¢×‘×•×¨×š ×›×ª×•×‘×•×ª IP.';
								if(!altAuth)
									return loadEpisode(fullload, token, true);
							break;
							
							case 404: msg = '×–×” ×ž×‘×™×š, ×”×¤×¨×§ ×œ× × ×ž×¦× ×‘×©×¨×ª ×”×¦×¤×™×™×” ×©×œ× ×•.<br />\
											×× ×• × ×•×“×” ×œ×š ×× ×ª×•×›×œ ×œ×“×•×•×— ×œ× ×• ×¢×œ ×›×š ×‘××ž×¦×¢×•×ª <a href=\"/feedback\">×˜×•×¤×¡ ×¦×•×¨ ×§×©×¨</a>.'; break;
							
							case 410: msg = '×‘×›×œ ×¦×¤×™×™×” ×‘×¤×¨×§ ×× ×• ×™×•×¦×¨×™× ×¢×‘×•×¨×š ×ž×–×”×” ×™×™×—×•×“×™. ×ž×–×”×” ×–×” ×¤×’ ×ª×•×§×£, × × ×‘×¦×¢/×™ ×¨×™×¢× ×•×Ÿ ×œ×“×£ ×–×” ×¢×œ ×ž× ×ª ×œ×™×¦×•×¨ ×ž×–×”×” ×—×“×©.'; break;
							
							case 429: msg = '×¢×‘×¨×ª ××ª ×ž×’×‘×œ×ª ×”×¦×¤×™×™×” ×‘×ž×§×‘×™×œ.<br />\
											×× ×• ×ž××¤×©×¨×™× ×œ×ž×©×ž×©×™× ×•××•×¨×—×™× ×œ×¦×¤×•×ª ×‘×¤×¨×§ ××—×“ ×‘×œ×‘×“ ×‘×¨×’×¢ × ×ª×•×Ÿ (×ª×•×¨×ž×™× ××™× × ×ž×•×’×‘×œ×™×).<br />'; break;
						}
						
						msg += '<br /><br />\
								×ž×–×”×” ×¤×¨×§: '+VID+'<br />\
								×©×¨×ª: '+e.url+'<br />\
								×©×’×™××”: '+xhr.status+'<br />\
								×¡×•×’: '+dir.watch;

						$('#loading #spinner').addClass('hidden').after('<div class="err"><h3>×©×’×™××”!</h3>'+msg+'</div>');
						$('#loading #waitTime').addClass('hidden');
						return false;
					},
					crossDomain: true,
					xhrFields: {
						withCredentials: true
					}
				}).done(function(){
					// Handle download links
					if(typeof e.download == 'undefined') {
						$('.download').addClass('disabled');
						$('#fakeDL').removeClass('hidden');
					} else {
						$('#afterLoad .download:not("#fakeDL")').remove();
						$.each(e.download, function(quality, key) {
							download[quality] 	= "//" + e.url + "/"+dir.down+"/episode/"+quality+"/"+ Sname[1]+".S"+season+"E"+episode+"_"+quality+"P/"+VID+".mp4?token="+key+"&time="+e.time+"&uid="+e.uid;
							$newBtn = $('#fakeDL').clone().removeAttr('id').removeClass('hidden').insertAfter('#fakeDL');
							$($newBtn).attr('href', download[quality]).find('span').text('×”×•×¨×“×ª ×”×¤×¨×§ ×‘××™×›×•×ª '+quality+'p');
							$('#player .download').attr('href', download[quality]);
						});
						
						$('#fakeDL').addClass('hidden');
					}
					
					var sources = [];
					$.each(e.watch, function(quality, key) {
						sources.push({"src": "//" + e.url + "/"+dir.watch+"/episode/"+quality+"/" + VID + ".mp4?token="+key+"&time="+e.time+"&uid="+e.uid, 'type': 'video/mp4', "label": quality+'P'});
					});
					
					var index = sources.length;
					sources[index-1]['selected'] = true; // set default source to higher quality available
					
					if(fullload === true) {
						if(typeof window.history.pushState === 'function')
							window.history.pushState('','',"/watch/" + SID + "-" + Sname[0] + "-" + Sname[1] +"/season/" + season + "/episode/" + episode);
							
						$('title').html("Sdarot.TV ×¡×“×¨×•×ª | " + Sname[2] + " ×¢×•× ×” " + season + " ×¤×¨×§ " + episode + " ×œ×¦×¤×™×™×” ×™×©×™×¨×”"); // html because Sname[2] is escaped
						$('#player .head p').text(e.heb + " / " + e.eng + ' - ×¢×•× ×” '+ season + ' ×¤×¨×§ ' + episode);
						$('#date').text(realDate(e.addtime));
						$('#views').text(numberFormat(e.viewnumber));
						$('#description').html(e.description);
						$('#player .stars p').remove();
					}
					
					rating = [e.rate, e.ratedby];
					setRating(rating, '#player');
					
					if(e.viewed == true) {
						$('#markAS i').removeClass('fa-eye').addClass('fa-eye-slash');
						$('#markAS span').text('×¡×ž×Ÿ ×¤×¨×§ ×›×œ× × ×¦×¤×”');
					} else {
						$('#markAS i').removeClass('fa-eye-slash').addClass('fa-eye');
						$('#markAS span').text('×¡×ž×Ÿ ×¤×¨×§ ×›× ×¦×¤×”');
					}
					
					// setup video player
					videojs('videojs', {
						controls: true,
						autoplay: false,
						preload: 'auto',
						loop: false,
						language: 'he',
						languages: {
							he: {
								"Seek forward {{seconds}} seconds": "×“×œ×’ {{seconds}} ×©× ×™×•×ª ×§×“×™×ž×”",
								"Seek back {{seconds}} seconds": "×—×–×•×¨ {{seconds}} ×©× ×™×•×ª ×œ××—×•×¨"
							}
						},
						options: {
							chromecast: {
								appId: 'DC149BE9',
								metadata: {
									title: Sname[2] + ' ×¢×•× ×” ' + season + ' ×¤×¨×§ ' + episode,
									subtitle: 'by Sdarot.tv',
								}
							}
						},
						plugins: {
							airplayButton: {},
						},						
						playbackRates: [0.25, 0.5, 1, 1.25, 1.5, 2],
					}, function() {
						var player = this;
							
						if(vast.length > 0) {
							console.log("init ads");
							player.vpluginAds({
								data: {
									adTag: [{
											id : "pre",
											duration : 30,
											position : 0,
											skip : 0,
											click : "",
											link : [ vast ]
									}]
								}
							});
						}
						
						this.volume(playerVolume/100); // sets default volume
						
						// setup seek buttons
						this.seekButtons({
							forward: 10,
							back: 10
						});
						
						// initialize hotkeys
						this.hotkeys({
							volumeStep: 0.1, // 10%
							seekStep: 5,
							enableModifiersForNumbers: false,
							enableVolumeScroll: false
						});
						
						// quality selector plugin
						player.controlBar.addChild('QualitySelector');
						player.src(sources);
						
						// episode title overlay plugin
						var title = {
							title: Sname[2] + ' ×¢×•× ×” ' + season + ' ×¤×¨×§ ' + episode,
							floatPosition: 'right',
							margin: '10px',
							fontSize: '20px'
						};
						player.titleoverlay(title);
						
						var halfFired = false; // Half of video played - Event fired
						var mostFired = false; // 90% of video played - Event fired
						
						this.on('timeupdate', function() {		
							var pos = Math.floor(this.currentTime()); // Current position
							var dur = Math.floor(this.duration()); // Video duration
							var pgs = Math.floor((pos / dur)*100); // % progress
							
							if(!halfFired && pgs > 50) { // Update views counter
								$.post('/ajax/watch', {count: VID, token: token});
								var views = $('#views').text().replace(',','');
								$('#views').text(numberFormat(++views));
								halfFired = true;
							}
							
							if(!mostFired && pgs > 90 && autoMarkWatched == true) { // Mark episode as watched
								markWatched(SID, season, episode, true); // true to force as watched, so force it to true make sure to prevent wired bugs when the episode completed more than once...
								mostFired = true;
							}
						});
						
						// on video complete (fired once)
						this.one('ended', function() {
							localStorage.removeItem('pos_'+VID); // remove last watched position, user watch this episode till the end.
						});
					});
					
					
					
					window.onunload = function() { // save last position - user navigate to somewhere else
						localStorage.setItem('pos_'+VID, videojs.getPlayer('videojs').currentTime());
					};
					
					$('#loading #txt').hide();
					$('#loading #spinner, #loading #waitTime').addClass('hidden');
					$('#afterLoad').removeClass('hidden');
				});
			}).fail(function() {
				$('#loading #spinner').addClass('hidden').after('<div class="err"><h3>×©×’×™××”!</h3>××¨×¢×” ×©×’×™××” ×‘×˜×¢×™× ×ª ×”×¤×¨×§. × ×¡×” ×œ×¨×¢× ×Ÿ ××ª ×”×“×£ ×•×œ×˜×¢×•×Ÿ ××ª ×”×¤×¨×§ ×©× ×™×ª.<br />×× ×©×’×™××” ×–×• ×—×•×–×¨×ª ×¢×œ ×¢×¦×ž×” × × ×¤× ×” ×œ×ž× ×”×œ×™ ×”××ª×¨ ×‘××ž×¦×¢×•×ª <a href=\"/feedback\">×˜×•×¤×¡ ×¦×•×¨ ×§×©×¨</a>.</div>');
				$('#loading #waitTime').addClass('hidden');
			});
		}
		
		function toggleLights() {
			if($('#lights i').hasClass('fa-moon-o')) { // turn lights off
				$('body').css('background-color', '#212121');
				$('section').addClass('dark');
				$('#lights span').text('×”××¨ ×ž×¡×š');
				$('#lights i').removeClass('fa-moon-o').addClass('fa-sun-o');
			} else { // turn lights on
				$('body').css('background-color', 'inherit');
				$('section:not(#loading)').removeClass('dark');
				$('#lights span').text('×”×—×©×š ×ž×¡×š');
				$('#lights i').removeClass('fa-sun-o').addClass('fa-moon-o');
			}
		}
		
		function markWatched(SID, se, ep, force) {
			// (Un)Mark episode as watched
			// GET:
			// SID = Serie ID
			// se = Season number
			// ep = Episode number
			
			if(!loggedIn)
				return false;
			
			if(typeof ep == 'undefined') { // (Un)Mark season
				var watched = $('#season li[data-season="'+se+'"]').hasClass('watched');
			} else { // (Un)Mark episode
				if(force === true)
					var watched = false;
				else
					var watched = $('#episode li[data-episode="'+ep+'"]').hasClass('watched');
			}
			
			$.ajax({
				url: '/ajax/watch',
				type: 'POST',
				data: {SID: SID, season: se, episode: ep, watched: watched},
				async: false,
				dataType: 'json',
			}).done(function(r){
				if(r.changed == true) {
					watched = r.watched;
					
					if(typeof ep == 'undefined') { // (Un)Mark full season
						if(watched === false) {
							$("#season li[data-season='"+se+"']").removeClass('watched');
							if(season == se) // current season
								$("#episode li").removeClass('watched');
						} else {
							$("#season li[data-season='"+se+"']").addClass('watched');
							if(season == se) // current season
								$("#episode li").addClass('watched');
						}
					} else { // (Un)Mark single episode
						if(watched === false) {
							$("#episode li[data-episode='"+ep+"']").removeClass("watched");
							if(ep == episode) { // change view details only if it's the current episode
								$("#view").removeClass('dis');
							}
						} else {
							$("#episode li[data-episode='"+ep+"']").addClass("watched");
							if(ep == episode) { // change view details only if it's the current episode
								$("#view").addClass('dis');
							}
						}
					}
					
					return true;
				}
			});
		}
		
		function urldecode(str) {
			return decodeURIComponent((str+'').replace(/\+/g, '%20'));
		}
		
		function numberFormat(num) {
			num += '';
			x = num.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}
			return x1 + x2;
		}
		
		function setRating(rating, elm) {
			// update text rating
			$(elm+' .rate').text(rating[0]);
			$(elm+' .ratedBy span').text(rating[1]);
			
			// clear all stars
			$(elm+' .stars i').removeClass('fa-star fa-star-o fa-star-half-o fa-flip-horizontal');
			
			$(elm+' .stars i').each(function(index) {
				if(index <= rating[0]-1)
					$(this).addClass('fa-star');
				else if(index <= Math.round(rating[0]-1))
					$(this).addClass('fa-star-half-o fa-flip-horizontal');
				else
					$(this).addClass('fa-star-o');
			});
		}
		
		function countdown(fullLoad, token) {
			timeout=timeout-0.1;
			var spinner = 1 / 30 * (30 - timeout);
			$('#spinner').circleProgress({value: spinner});
			timeout = round(timeout, 2);
			$('#waitTime span').text(timeout);
			if(timeout<=0) {
				clearInterval(counter);
				counter = false;
				loadEpisode(fullLoad, token);
			}
		}
		
		function realDate(timestamp){
			var a = new Date(timestamp*1000);
			var year = a.getFullYear();
			var month = a.getMonth() + 1; // return months as 0-11
			var date = a.getDate();
			var hour = a.getHours();
			var min = a.getMinutes();
			if(min < 10)
				min = '0'+min; // leading zero
			var sec = a.getSeconds();
			if(sec <= 9)
				sec = "0" + sec;
			var time = date+'.'+month+'.'+year+' '+hour+':'+min+':'+sec;
			return time;
		}
		
		function round(value, decimals) {
			return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
		}
		
		function setCookie(cname, cvalue, exdays) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays*24*60*60*1000));
			var expires = "expires="+ d.toUTCString();
			document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
		}
	}
	
	// live search
	$('#liveSearch').typeahead({
		minLength: 3,
		delay: 200,
		source: function(query, callback) {
			$.get('/ajax/index', {search: query}, function(r){
				callback(r);
			}, 'json');
		},
		afterSelect: function(active) {
			window.location = '/watch/'+active.id;
		}
	});
	
	// mouse enter serie image
	$('#newSeries, #seriesList').on('mouseenter', 'img', function(){
		var elm = $(this).parent().find('.sInfo');
		elm.stop().slideDown().animate({opacity: 1}, {queue: false});
	});
	
	// mouse leave serie info
	$('#newSeries, #seriesList').on('mouseleave', '.sInfo', function(){
		$('.sInfo').stop().slideUp().animate({opacity: 0}, {queue: false});
	});
	
	// Adjust player volume (usercp)
	$("input[name='player_volume']").change(function(){
		$("#volume").text($("input[name='player_volume']").val()+'%');
	});
	
	// Handle progress bars (server status, tracking and maybe more)
	$(".progress-bar").each(function(){
		var width = $(this).attr('aria-valuenow');
		$(this).animate({ width: width+"%"}, 1500);
	});
	
	// index: navigate next/prev series
	$('#newSeries').on('click', 'button:not(.disabled)', function(){
		var action = $(this).data('action');
		var elm = $(this);
		$(elm).addClass('disabled');
		
		if(action == 'next')
			++serie_page;
		else
			serie_page = serie_page - 1;
		
		if(serie_page <= 1)
			$('#newSeries button[data-action="prev"]').addClass('disabled');
		else
			$('#newSeries button[data-action="prev"]').removeClass('disabled');
		
		var jqx = $.get('/ajax/index', {series: serie_page}, function(){})
		.done(function(r) {
			$('#newSeries .content .row').html(r);
		})
		.fail(function() {
			$('#newSeries .content .row').html('<p>××•×¤×¡! ×œ× ×”×¦×œ×—× ×• ×œ×˜×¢×•×Ÿ ×¡×“×¨×•×ª × ×•×¡×¤×•×ª. ×¨×¢× ×Ÿ ××ª ×”×¢×ž×•×“ ×•× ×¡×” ×©× ×™×ª</p>');
		})
		.always(function(){
			if(action != 'prev' && serie_page > 1)
				$(elm).removeClass('disabled');
		});
	});
	
	// index: naviage next/prev episodes
	$('#newEpisodes').on('click', 'button:not(.disabled), ul li:not(.active)', function(){
		var action = $(this).data('action');
		
		if(typeof action == 'undefined') { // click on tab
			$('#newEpisodes ul li').removeClass('active').addClass('pointer');
			$(this).addClass('active').removeClass('pointer');
			ep_page = 1;
		}
		
		var get = $("#newEpisodes ul li.active").data('type');
		if(typeof get == 'undefined')
			get = 'topnew';
		
		var elm = $(this);
		$(elm).addClass('disabled');
		
		if(action == 'next')
			++ep_page;
		else if(action == 'prev')
			ep_page = ep_page - 1;
		
		if(ep_page <= 1)
			$('#newEpisodes button[data-action="prev"]').addClass('disabled');
		else
			$('#newEpisodes button[data-action="prev"]').removeClass('disabled');
		
		var jqx = $.get('/ajax/index', {tab: get, page: ep_page}, function(){})
		.done(function(r) {
			$('#newEpisodes .content').html(r);
			if(typeof window.history.pushState === 'function')
				window.history.pushState('','','?tab='+get+'&page='+ep_page);
			$('html, body').animate({
				scrollTop: $('#newEpisodes .content').offset().top
			}, 2000);
		})
		.fail(function() {
			$('#newEpisodes .content').html('<p>××•×¤×¡! ×œ× ×”×¦×œ×—× ×• ×œ×˜×¢×•×Ÿ ×¤×¨×§×™× × ×•×¡×¤×™×. ×¨×¢× ×Ÿ ××ª ×”×¢×ž×•×“ ×•× ×¡×” ×©× ×™×ª</p>');
		})
		.always(function(){
			if(action != 'prev' && ep_page > 1)
				$(elm).removeClass('disabled');
		});
	});
});

function recaptchaSubmit(token) {
	$('form').submit();
}
