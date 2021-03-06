import { Mutation } from 'react-apollo';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CurrentUser from "./CurrentUser";
import {
  SINGLE_POST_QUERY,
  LIKE_POST_MUTATION,
  UNLIKE_POST_MUTATION,
  LIKED_POSTS_QUERY,
  SINGLE_USER_QUERY
} from '../apollo/queries';

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  cursor: pointer;
`;

const LikeButton = ({ postId, postLikes }) => (
  <CurrentUser>
    {({ data: { currentUser } }) => {
      const mutate = postLikes.map(like => like.user.id).includes(currentUser.id) ? 'unlikePost' : 'likePost';
      const id = postLikes.map(like => like.user.id).includes(currentUser.id) ? postLikes.filter(like  => like.user.id === currentUser.id)[0].id : postId;

      return currentUser ? (
        <Mutation
          SINGLE_USER_QUERY
          mutation={
            postLikes.map(like => like.user.id).includes(currentUser.id)
              ? UNLIKE_POST_MUTATION
              : LIKE_POST_MUTATION
          }
          variables={
            postLikes.map(like => like.user.id).includes(currentUser.id)
              ? {
                  id: postLikes.filter(
                    like => like.user.id === currentUser.id
                  )[0].id
                }
              : { id: postId }
          }
          optimisticResponse={{
            // https://www.apollographql.com/docs/react/features/optimistic-ui
            __typeName: "Mutation", // TODO: Not sure if doing this right ~ no increase in speed it seems
            [mutate]: {
              __typename: "Like",
              id
            }
          }}
          refetchQueries={[
            { query: SINGLE_POST_QUERY, variables: { id: postId } },
            {
              query: LIKED_POSTS_QUERY,
              variables: { id: currentUser.id }
            },
            {
              query: SINGLE_USER_QUERY,
              variables: { id: currentUser.id }
            }
          ]}
        >
          {(mutate, { loading, error }) => (
            <StyledFontAwesomeIcon
              icon={
                postLikes
                  .map(like => like.user.id)
                  .includes(currentUser.id)
                  ? ["fas", "heart"]
                  : ["fal", "heart"]
              }
              color={
                postLikes
                  .map(like => like.user.id)
                  .includes(currentUser.id)
                  ? "var(--color-red)"
                  : "var(--color-black)"
              }
              size="lg"
              onClick={mutate}
            />
          )}
        </Mutation>
      ) : null;
    }}
  </CurrentUser>
);

export default LikeButton;
