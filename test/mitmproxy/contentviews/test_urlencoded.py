from mitmproxy.contentviews import urlencoded
from mitmproxy.net.http import url
from . import full_eval


def test_view_urlencoded():
    v = full_eval(urlencoded.ViewURLEncoded())

    d = url.encode([("one", "two"), ("three", "four")]).encode()
    assert v(d)

    d = url.encode([("adsfa", "")]).encode()
    assert v(d)

    assert not v(b"\xFF\x00")
