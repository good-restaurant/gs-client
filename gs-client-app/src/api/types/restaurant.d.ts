    // src/api/types/restaurant.d.ts

    export interface RestaurantDto {
        id?: number
        restaurantName: string
        address?: string
        lat?: number
        lon?: number
    }
    
    export interface RestaurantDetailDto extends RestaurantDto {
        comments?: CommentDto[]
    }
    
    export interface CommentDto {
        id?: number
        content: string
        rating: number
        displayName?: string
    }
    