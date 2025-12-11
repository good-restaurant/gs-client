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

    export interface restaurantIdDto {
        id: number
        restaurantName?: string
    }
    
    export interface CommentDto {
        id?: number
        content: string
        rating: number
        displayName?: string
        restaurant?: restaurantIdDto
    }
    
    export interface MenuDto {
        id?: number
        name: string
        description?: string | null
        price?: number
        pictureUuid?: string | null
        restaurantId?: number  // API 호출 시에만 사용
    }
    