# Druidscope server

RESTful service to interact with druid.io.


### POST /filter

Filter, aggregate, select queries.

```
  {
    "filters": {
        "group": {
            "filter":   ["2", "3", "4", "5", "6", "7", "8"],
            "type": "categorical"
        }
    },
    "aggregations": {
        "A": {
            "type": "count"
        }
    },
    "select": {
        "email": {
            "limit": 10
        }
      }
  }
```
