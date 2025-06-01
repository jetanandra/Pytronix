/*
  # Manually recalculate all product ratings

  This migration will update all product ratings and review counts
  by calling the recalculate_all_product_ratings function created
  in the previous migration.
*/

-- Call the function to recalculate all product ratings
SELECT recalculate_all_product_ratings();