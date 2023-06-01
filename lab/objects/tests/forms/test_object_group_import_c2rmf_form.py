from unittest import mock

import pytest
from django.forms import ValidationError

from ...c2rmf import ErosHTTPError
from ...forms import ObjectGroupImportC2RMFForm


@mock.patch("lab.objects.forms.fetch_partial_objectgroup_from_eros")
def test_clean_fetch_data(mock_fetch: mock.MagicMock):
    mock_fetch.return_value = {
        "c2rmf_id": "C2RMF00000",
        "label": "Test",
        "object_count": 1,
    }
    form = ObjectGroupImportC2RMFForm()
    form.cleaned_data = {"c2rmf_id": "C2RMF00000"}
    cleaned_data = form.clean()

    mock_fetch.assert_called_once_with("C2RMF00000")
    assert cleaned_data["label"] == "Test"
    assert cleaned_data["object_count"] == 1


@mock.patch("lab.objects.forms.fetch_partial_objectgroup_from_eros")
def test_clean_raises_if_fetch_none(mock_fetch: mock.MagicMock):
    mock_fetch.return_value = None
    form = ObjectGroupImportC2RMFForm()
    form.cleaned_data = {"c2rmf_id": "C2RMF00000"}
    with pytest.raises(ValidationError):
        form.clean()


@mock.patch("lab.objects.forms.fetch_partial_objectgroup_from_eros")
def test_clean_raises_if_fetch_fails(mock_fetch: mock.MagicMock):
    mock_fetch.side_effect = ErosHTTPError()
    form = ObjectGroupImportC2RMFForm()
    form.cleaned_data = {"c2rmf_id": "C2RMF00000"}
    with pytest.raises(ValidationError):
        form.clean()
