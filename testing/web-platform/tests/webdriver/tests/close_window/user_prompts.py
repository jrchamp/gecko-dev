import pytest

from tests.support.asserts import assert_dialog_handled, assert_error, assert_success


def close(session):
    return session.transport.send(
        "DELETE", "session/{session_id}/window".format(**vars(session)))


@pytest.mark.capabilities({"unhandledPromptBehavior": "accept"})
@pytest.mark.parametrize("dialog_type", ["alert", "confirm", "prompt"])
def test_handle_prompt_accept(session, create_dialog, create_window, dialog_type):
    original_handle = session.window_handle

    session.window_handle = create_window()
    create_dialog(dialog_type, text="dialog")

    response = close(session)
    assert_success(response)

    # Asserting that the dialog was handled requires valid top-level browsing
    # context, so we must switch to the original window.
    session.window_handle = original_handle
    assert_dialog_handled(session, expected_text="dialog")


def test_handle_prompt_accept_and_notify():
    """TODO"""


def test_handle_prompt_dismiss():
    """TODO"""


def test_handle_prompt_dismiss_and_notify():
    """TODO"""


def test_handle_prompt_ignore():
    """TODO"""


@pytest.mark.parametrize("dialog_type", ["alert", "confirm", "prompt"])
def test_handle_prompt_default(session, create_dialog, create_window, dialog_type):
    session.window_handle = create_window()

    create_dialog(dialog_type, text="dialog")

    response = close(session)
    assert_error(response, "unexpected alert open")

    assert_dialog_handled(session, expected_text="dialog")
