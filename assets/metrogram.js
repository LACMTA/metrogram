/*
	Created by Kaspars Dambis
	http://konstruktors.com

CONFIG = {
	'client_id': 'xxxxxxxxx',
	'client_secret': 'yyyyyyyyyy',
	'redirect_uri': 'http://localhost:8515/oauth_callback',
	'access_token' : u'xxx.yyyyy',
	'user_info' : {
		u'username': u'metrolosangeles',
		u'bio': u'We provide transit service, organize vanpools and build road and transportation projects in Los Angeles County. \u24c2\U0001f688\U0001f6b2\U0001f6b6\U0001f68c\nTwitter: @metrolosangeles',
		u'website': u'http://www.metro.net',
		u'profile_picture': u'https://instagramimages-a.akamaihd.net/profiles/profile_528727108_75sq_1377723368.jpg',
		u'full_name': u'Metro Los Angeles',
		u'id': u'528727108',
	},
}


*/

var metrogram = angular.module(
		'metrogram', []
	).config(
		['$routeProvider', '$locationProvider', function( $routeProvider, $locationProvider ) {
			$routeProvider.when('/tag/:tag');
		}]
  	).controller(
		'slideshow', function ( $scope, $http, $timeout, $route, $location ) {
			// Set the API endpoint
			var api = 'https://api.instagram.com/v1/tags/%tag%/media/recent?access_token=xxxx.yyyyyy&callback=JSON_CALLBACK',
				newReq, refreshApi;

			// $scope.delete = function ( idx ) {
			// 	var image_to_delete = $scope.images[idx];

			// 	API.DeleteImage({ id: image_to_delete.id }, function (success) {
			// 		$scope.images.splice(idx, 1);
			// 	});
			// };

			$scope.fetchImages = function() {
				
				$scope.loadingClass = 'loading';
				$scope.imgCurrent = 0;

				if ( ! $route.current )
					$location.path( '/tag/' + $scope.tag );
				else if ( angular.isDefined( $route.current.params.tag ) )
					$scope.tag = $route.current.params.tag;

				$http.jsonp( 
					api.replace( '%tag%', $scope.tag )
				).success( function( data ) {
					delete $scope.loadingClass;

					// we're gonna push clean images into the $scope (drg)
					var clean = data.data;
					$scope.images = [];

					// Let's remove images that we haven't liked (drg)
					for (var i = 0; i < clean.length; i++){
						if (clean[i].user_has_liked == false){
							// console.log('index: ' + i + ' liked? ' +clean[i].user_has_liked);
							clean.splice(i,1);
							// console.log('removed one at index: ' + i);
						} else {
							$scope.images.push(clean[i]);
						}
					};

					// Set the first image active
					if ( data.data.length )
						$scope.makeActiveSlide( $scope.imgCurrent );

					// Cancel the previous update request
					if ( refreshApi )
						$timeout.cancel( refreshApi );

					// Check for new images on every loop
					if ( data.data.length )
						refreshApi = $timeout( $scope.fetchImages, 8000 * data.data.length );
				}).error( function() {
					delete $scope.loadingClass;
					refreshApi = $timeout( $scope.fetchImages, 2000 );
				});
			}

			// Fetch images
			$timeout( $scope.fetchImages );

			$scope.advanceSlide = function() {
				// Method 1
				// Use a classname to highlight the current active slide
				
				if ( angular.isDefined( $scope.images ) && $scope.images.length )
					$scope.makeActiveSlide( $scope.imgCurrent + 1 );

				/*
				// Method 2
				// Just flush the array elements around
				if ( angular.isDefined( $scope.images ) )
					$scope.images.push( $scope.images.shift() );
				*/

				$timeout( $scope.advanceSlide, 7000 );
			}

			// Advance slides
			$timeout( $scope.advanceSlide );

			$scope.makeActiveSlide = function( index ) {
				// Inactivate the previous slide
				delete $scope.images[ $scope.imgCurrent ].isActive;
				// Select the next slide
				$scope.imgCurrent = ( index ) % $scope.images.length;
				// Activate the next slide
				$scope.images[ $scope.imgCurrent ].isActive = true;
			}

			$scope.tagChange = function() {
				$location.path( '/tag/' + $scope.tag );

				if ( newReq )
					$timeout.cancel( newReq );

				newReq = $timeout( function() {
					$scope.fetchImages();
					$timeout.cancel( newReq );
				}, 1000);
			}
		}
	).filter(
		'escape', function () {
			return function( input ) {
				return escape( input );
			}
		}	
	);

