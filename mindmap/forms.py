# -*- coding: utf-8 -*-
from django import forms
from .models import MindMap, MindMapComponent


class MindMapForm(forms.ModelForm):
    class Meta:
        model = MindMap
        fields = ('name',)


class MindMapComponentForm(forms.ModelForm):
    class Meta:
        model = MindMapComponent
        fields = ('title', 'parent', 'pos_left', 'pos_top')

    parent = forms.ModelChoiceField(queryset=MindMapComponent.objects.none(), widget=forms.HiddenInput)
    pos_left = forms.CharField(widget=forms.HiddenInput)
    pos_top = forms.CharField(widget=forms.HiddenInput)

    def __init__(self, mindmap=None, *args, **kwargs):
        super(MindMapComponentForm, self).__init__(*args, **kwargs)
        if mindmap:
            self.fields['parent'].queryset = mindmap.root_component.get_descendants(include_self=True)

