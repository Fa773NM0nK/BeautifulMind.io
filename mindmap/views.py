# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, get_object_or_404
from django.core import serializers
from django.utils import simplejson
from .models import MindMap, MindMapComponent
from .forms import MindMapForm


def index(request):
    return render_to_response('mindmap/mindmap.html',
            {},
            context_instance=RequestContext(request))


def map_show(request, mindmap_slug):
    mindmap = get_object_or_404(MindMap, slug=mindmap_slug)
    return render_to_response('mindmap/mindmap.html',
            {
                'mindmap': mindmap
            },
            context_instance=RequestContext(request))


def map_new(request):
    if request.method == 'POST':
        form = MindMapForm(data=request.POST)
        if form.is_valid():
            form.save()
    else:
        form = MindMapForm()

    return render_to_response('mindmap/map_new.html',
            { 'form': form },
            context_instance=RequestContext(request))


def map_components(request, mindmap_pk):
    mindmap = get_object_or_404(MindMap, pk=mindmap_pk)
    components = mindmap.root_component.get_descendants(include_self=True)
    return HttpResponse(simplejson.dumps(
        serializers.serialize('json', components or [], fields=('pk','title', 'pos_top', 'pos_left', 'level', 'parent'))
    ), 'application/json')