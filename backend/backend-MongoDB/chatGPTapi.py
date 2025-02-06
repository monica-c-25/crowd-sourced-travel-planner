from openai import OpenAI
from os import getenv
from dotenv import load_dotenv

client = OpenAI(
  api_key=getenv('OPENAI_API_KEY')
)

completion = client.chat.completions.create(
  model="gpt-4o-mini",
  store=True,
  messages=[
    {"role": "user", "content": "Give me a recommendation of top 5 places to visit in South Carolina."}
  ]
)

print(completion.choices[0].message);
