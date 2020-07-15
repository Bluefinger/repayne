+++
date = "2016-12-09T09:00:00Z"
title = "YBlog"
tags = ["javascript", "css", "html5", "canvas2d"]
[[resource]]
title = "YBlog platform example"
src = "yblog-front-header.jpg"
[[resource]]
title = "YBlog admin screen"
src = "yblog-admin.jpg"
[[resource]]
title = "YBlog Mobile view"
src = "yblog-mobile.jpg"
[[resource]]
title = "YBlog Mobile view with expanded content section"
src = "yblog-mobile2.jpg"
+++

YBlog is a combined blogging and mapping service for [YB Tracking](https://www.ybtracking.com/) customers, to display progress during journeys/adventures/races by including tracking data, blog posts and images taken during the trip.

<!--more-->

The YBlog app exists as a pure JS application, taking a JSON feed and using precompiled templates to generate the blog upon visit. The admin section for users looking to manage their YBlog is part of the same application, with the admin templates loaded upon logging in to create the dashboard and admin pages. Built with ES6 standard JS, Lodash, Google Maps, and uses Canvas for rendering the overlay for all the tracking/blog data, which for blogs with large sets of position data is more performant than using Google Maps' own drawing/overlay features.

YBlog is also fully responsive, with both the public and admin section designed to be mobile-friendly.
