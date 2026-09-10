import { Grid, Rating, Stack, Typography } from '@mui/material';

import Avatar from 'components/@extended/Avatar';

import { StarFilled, StarOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

const avatarImage = require.context('assets/images/users', true);

interface ReviewProps {
  avatar: string;
  date: Date | string;
  name: string;
  rating: number;
  review: string;
}

const ProductReview = ({ avatar, date, name, rating, review }: ReviewProps) => (
  <Grid item xs={12}>
    <Stack direction="row" spacing={1}>
      <Avatar alt={name} src={avatar && avatarImage(`./${avatar}`)} />
      <Stack spacing={2}>
        <Stack>
          <Typography variant="subtitle1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            {name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {date as ReactNode}
          </Typography>
          <Rating
            size="small"
            name="simple-controlled"
            value={rating < 4 ? rating + 1 : rating}
            icon={<StarFilled style={{ fontSize: 'inherit' }} />}
            emptyIcon={<StarOutlined style={{ fontSize: 'inherit' }} />}
            precision={0.1}
            readOnly
          />
        </Stack>
        <Typography variant="body2">{review}</Typography>
      </Stack>
    </Stack>
  </Grid>
);

export default ProductReview;
