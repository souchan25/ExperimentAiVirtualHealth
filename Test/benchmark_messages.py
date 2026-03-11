import time
import uuid
import random

def _normalize_id(value) -> str:
    if value is None:
        return ""
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, (bytes, bytearray)):
        try:
            if len(value) == 16:
                return str(uuid.UUID(bytes=bytes(value)))
            return value.decode("utf-8", errors="ignore")
        except Exception:
            return str(value)
    if isinstance(value, int):
        return str(value)
    text_value = str(value)
    try:
        return str(uuid.UUID(text_value))
    except Exception:
        return text_value

class MockRow:
    def __init__(self, id, recipient_id, sender_id=None, content=None, timestamp=None, is_read=False):
        self.id = id
        self.recipient_id = recipient_id
        self.sender_id = sender_id
        self.content = content
        self.timestamp = timestamp
        self.is_read = is_read

def current_get_messages(rows, current_user_id):
    uid = _normalize_id(current_user_id)
    user_map = {str(i): f"User {i}" for i in range(1, 3)}

    serialized = []
    for row in rows:
        sender_id = _normalize_id(row.sender_id)
        recipient_id = _normalize_id(row.recipient_id)
        if sender_id != uid and recipient_id != uid:
            continue

        serialized.append({
            "id": _normalize_id(row.id),
            "sender_id": sender_id,
            "recipient_id": recipient_id,
            "sender_name": user_map.get(sender_id),
            "recipient_name": user_map.get(recipient_id),
            "content": row.content,
            "is_read": bool(row.is_read),
            "timestamp": row.timestamp,
        })
    return serialized

def optimized_get_messages_sim(rows, current_user_id):
    # Simulated DB-level filter
    uid = current_user_id
    filtered = [row for row in rows if row.sender_id == uid or row.recipient_id == uid]

    user_map = {i: f"User {i}" for i in range(1, 10)} # Simplified
    serialized = []
    for row in filtered:
        serialized.append({
            "id": _normalize_id(row.id),
            "sender_id": _normalize_id(row.sender_id),
            "recipient_id": _normalize_id(row.recipient_id),
            "sender_name": f"User {row.sender_id}",
            "recipient_name": f"User {row.recipient_id}",
            "content": row.content,
            "is_read": bool(row.is_read),
            "timestamp": row.timestamp,
        })
    return serialized

def current_mark_message_as_read(rows, message_id, current_user_id):
    uid = _normalize_id(current_user_id)
    target_id = None
    for row in rows:
        if _normalize_id(row.id) == str(message_id) and _normalize_id(row.recipient_id) == uid:
            target_id = row.id
            break
    if target_id is None:
        return None
    return target_id

def optimized_mark_message_as_read_sim(rows_dict, message_id, current_user_id):
    # Simulated index lookup O(1)
    return rows_dict.get((str(message_id), current_user_id))

def run_benchmark():
    num_messages = 100000
    print(f"Generating {num_messages} messages...")
    rows = []
    rows_dict = {}
    for i in range(num_messages):
        s_id = random.randint(1, 5)
        r_id = random.randint(1, 5)
        row = MockRow(id=uuid.uuid4(), sender_id=s_id, recipient_id=r_id, content=f"Msg {i}", timestamp=time.time())
        rows.append(row)
        rows_dict[(str(row.id), r_id)] = row

    target_message = rows[num_messages - 1]

    print("\n--- get_messages (User 1) ---")
    start = time.perf_counter()
    current_get_messages(rows, 1)
    end = time.perf_counter()
    t1 = end - start
    print(f"Current (Python-side filter): {t1:.4f}s")

    start = time.perf_counter()
    optimized_get_messages_sim(rows, 1)
    end = time.perf_counter()
    t2 = end - start
    print(f"Optimized (Simulated DB filter): {t2:.4f}s")
    print(f"Improvement: {t1/t2:.1f}x faster on CPU")

    print("\n--- mark_message_as_read ---")
    start = time.perf_counter()
    current_mark_message_as_read(rows, target_message.id, target_message.recipient_id)
    end = time.perf_counter()
    t3 = end - start
    print(f"Current (Full scan, O(N)): {t3:.4f}s")

    start = time.perf_counter()
    optimized_mark_message_as_read_sim(rows_dict, target_message.id, target_message.recipient_id)
    end = time.perf_counter()
    t4 = end - start
    print(f"Optimized (Indexed lookup, O(1)): {t4:.4f}s")
    print(f"Improvement: {t3/t4:.4f}x faster on CPU")
    print(f"Note: In a real database, O(1) or O(log N) lookup is massively faster than O(N) full table scan.")

if __name__ == "__main__":
    run_benchmark()
