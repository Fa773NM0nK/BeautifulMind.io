# -*- coding: utf-8 -*-
from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
from django.conf import settings


admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'BeautifulMind.views.home', name='home'),
    url(r'^', include('beautifulmind.mindmap.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)


if settings.ENVIRONMENT.IS_FOR_DEVELOPMENT:
    urlpatterns += patterns('',
        (r'^assets/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        (r'^admin_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT+'../admin_media/', 'show_indexes': True}),
    )