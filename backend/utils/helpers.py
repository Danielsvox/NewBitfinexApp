import bcrypt
from typing import List


def TradingPairSlicer(string: str) -> List[str]:
    """Splits a trading pair string into its components ['BASE', 'QUOTE']."""
    if len(string) > 6:
        return string.split(':')
    else:
        p = 3
        return [string[z - p:z] for z in range(p, len(string) + p, p)]


def transform_data(tickers_dict):
    transformed_data = []
    for key_tuple, value in tickers_dict.items():
        ticker_data = {
            "ticker": key_tuple[0],
            "baseCurrency": key_tuple[1],
            "quoteCurrency": key_tuple[2],
            "verboseName": key_tuple[3],
            # Convert the dataclass instance to a dictionary
            "tickerData": vars(value)
        }
        transformed_data.append(ticker_data)
    return transformed_data


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def check_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
