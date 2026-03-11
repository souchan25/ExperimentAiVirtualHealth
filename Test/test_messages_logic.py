import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from fastapi import HTTPException
from FastAPI.app.api.messages import get_messages, mark_message_as_read

# --- Mocking SQLAlchemy ---
class MockUser:
    def __init__(self, id, name):
        self.id = id
        self.name = name

class MockMessage:
    def __init__(self, id, sender_id, recipient_id, content="hello", is_read=False, timestamp=None):
        self.id = id
        self.sender_id = sender_id
        self.recipient_id = recipient_id
        self.content = content
        self.is_read = is_read
        self.timestamp = timestamp

@pytest.mark.asyncio
async def test_get_messages_filters_correctly():
    # Setup
    user1 = MockUser(id=1, name="Alice")
    user2 = MockUser(id=2, name="Bob")
    user3 = MockUser(id=3, name="Charlie")

    current_user = user1

    # Mock DB session
    db = AsyncMock()

    # Mock users result
    users_result = MagicMock()
    users_result.all.return_value = [user1, user2, user3]
    db.execute.side_effect = [users_result, MagicMock()]

    # Mock messages result
    messages = [
        MockMessage(id=uuid4(), sender_id=1, recipient_id=2), # User 1 sent
        MockMessage(id=uuid4(), sender_id=2, recipient_id=1), # User 1 received
        MockMessage(id=uuid4(), sender_id=2, recipient_id=3), # Not User 1
    ]

    # Filtered messages (as the DB would return them)
    filtered_messages = [messages[0], messages[1]]

    messages_result = db.execute.side_effect[1]
    messages_result.scalars.return_value.all.return_value = filtered_messages

    # Execute
    result = await get_messages(db, current_user)

    # Verify
    assert len(result) == 2
    for msg in result:
        assert str(msg["sender_id"]) == "1" or str(msg["recipient_id"]) == "1"

    # Verify the query used 'or_' with correct conditions
    args, kwargs = db.execute.call_args_list[1]
    query = args[0]
    # We can't easily inspect the query's where clause without deep knowledge of SQLAlchemy internals
    # but we can verify that db.execute was called twice
    assert db.execute.call_count == 2

@pytest.mark.asyncio
async def test_mark_message_as_read_security():
    # Setup
    user1 = MockUser(id=1, name="Alice")
    user2 = MockUser(id=2, name="Bob")

    msg_id = uuid4()
    # Message belongs to User 2 (recipient_id=2)
    message = MockMessage(id=msg_id, sender_id=1, recipient_id=2)

    db = AsyncMock()
    result_mock = MagicMock()
    db.execute.return_value = result_mock

    # Test 1: User 1 tries to mark User 2's message as read
    result_mock.scalars.return_value.first.return_value = None # Not found for User 1

    with pytest.raises(HTTPException) as excinfo:
        await mark_message_as_read(str(msg_id), db, user1)
    assert excinfo.value.status_code == 404

    # Test 2: User 2 marks their own message as read
    result_mock.scalars.return_value.first.return_value = message

    res = await mark_message_as_read(str(msg_id), db, user2)
    assert res == {"status": "success"}
    assert message.is_read is True
    db.commit.assert_called()
