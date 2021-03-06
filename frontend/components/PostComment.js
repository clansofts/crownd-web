import { Mutation } from 'react-apollo';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup'
import CurrentUser from "./CurrentUser";
import { SINGLE_POST_QUERY, ADD_COMMENT_MUTATION } from '../apollo/queries';
import { Fragment } from 'react';
import styled from "styled-components";

const CommentSchema = Yup.object().shape({
  text: Yup.string()
    .required('Comment can not be blank.')
    //.min(1, 'Comment can not be blank.')
});

const StyledField = styled(Field)`
  border: 0;
  outline: 0;
  font-size: 1.4rem;
  line-height: 1.8rem;
  ::placeholder {
    color: #999999;
  }
`;

const StyledForm = styled(Form)`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  cursor: pointer;
`;

const PostComment = ({ postId }) => {
  return (
    <CurrentUser>
      {({ data: { currentUser } }) => (
        currentUser && currentUser ?
          <Mutation
            mutation={ADD_COMMENT_MUTATION}
            refetchQueries={[{ query: SINGLE_POST_QUERY, variables: { id: postId } }]}
          >
            {(addComment, { error, loading }) => (
              <Fragment>
                <Formik
                  initialValues={{ text: '' }}
                  validationSchem={CommentSchema}
                  onSubmit={async (values, { resetForm }) => {
                    try {
                      await addComment({ variables: { ...values, id: postId }});
                      resetForm();
                    } catch(e) {
                      console.error(`Formik Error: ${e}`);
                    }
                  }}
                >
                  {({
                    isSubmitting
                  }) => (
                    <StyledForm>
                      <StyledField type="text" name="text" placeholder="Add a comment..." />
                      <ErrorMessage name="text" />
                    </StyledForm>
                  )}
                </Formik>
                {loading && <p>Loading...</p>}
                {error && <p>Error :( Please try again</p>}
              </Fragment>
            )}
          </Mutation>
        : null
      )}
    </CurrentUser>
  );
}

export default PostComment;