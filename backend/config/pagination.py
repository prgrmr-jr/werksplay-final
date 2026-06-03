from rest_framework.pagination import PageNumberPagination


class FlexiblePageNumberPagination(PageNumberPagination):
    """
    Default page size = 50.
    Any view can pass ?page_size=N to override (capped at 500).
    Use ?page_size=1000 on player/game dropdowns to get all records at once.
    """
    page_size            = 50
    page_size_query_param = "page_size"
    max_page_size        = 500
