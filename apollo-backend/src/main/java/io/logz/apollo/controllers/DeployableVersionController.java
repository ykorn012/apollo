package io.logz.apollo.controllers;

import io.logz.apollo.common.HttpStatus;
import io.logz.apollo.dao.DeployableVersionDao;
import io.logz.apollo.models.DeployableVersion;
import io.logz.apollo.scm.CommitDetails;
import io.logz.apollo.scm.GithubConnector;
import org.rapidoid.annotation.Controller;
import org.rapidoid.annotation.GET;
import org.rapidoid.annotation.POST;
import org.rapidoid.http.Req;
import org.rapidoid.security.annotation.LoggedIn;

import javax.inject.Inject;
import java.util.List;

import static io.logz.apollo.common.ControllerCommon.assignJsonResponseToReq;
import static java.util.Objects.requireNonNull;

/**
 * Created by roiravhon on 12/20/16.
 */
@Controller
public class DeployableVersionController {

    private final DeployableVersionDao deployableVersionDao;

    @Inject
    public DeployableVersionController(DeployableVersionDao deployableVersionDao) {
        this.deployableVersionDao = requireNonNull(deployableVersionDao);
    }

    @LoggedIn
    @GET("/deployable-version")
    public List<DeployableVersion> getAllDeployableVersion() {
        return deployableVersionDao.getAllDeployableVersions();
    }

    @LoggedIn
    @GET("/deployable-version/{id}")
    public DeployableVersion getDeployableVersion(int id) {
        return deployableVersionDao.getDeployableVersion(id);
    }

    @LoggedIn
    @GET("/deployable-version/sha/{sha}/service/{serviceId}")
    public DeployableVersion getDeployableVersionFromSha(String sha, int serviceId) {
        return deployableVersionDao.getDeployableVersionFromSha(sha, serviceId);
    }

    @LoggedIn
    @GET("/deployable-version/latest/service/{serviceId}")
    public List<DeployableVersion> getLatestDeployableVersionsByServiceId(int serviceId) {
        return deployableVersionDao.getLatestDeployableVersionsByServiceId(serviceId);
    }

    @LoggedIn
    @GET("/deployable-version/latest/branch/{branchName}/repofrom/{deployableVersionId}")
    public DeployableVersion getLatestDeployableVersionOnBranchBasedOnOtherDeployableVersion(String branchName, int deployableVersionId, Req req) {
        DeployableVersion referenceDeployableVersion = deployableVersionDao.getDeployableVersion(deployableVersionId);
        String actualRepo = getRepoNameFromRepositoryUrl(referenceDeployableVersion.getGithubRepositoryUrl());

        String latestSha = GithubConnector.getLatestCommitShaOnBranch(actualRepo, branchName);

        if (latestSha == null) {
            assignJsonResponseToReq(req, HttpStatus.BAD_REQUEST, "Did not found latest commit on that branch");
            throw new RuntimeException();
        } else {
            DeployableVersion deployableVersionFromSha = deployableVersionDao.getDeployableVersionFromSha(latestSha, referenceDeployableVersion.getServiceId());
            if (deployableVersionFromSha == null) {
                assignJsonResponseToReq(req, HttpStatus.BAD_REQUEST, "Did not found deployable version matching the sha " + latestSha);
                throw new RuntimeException();
            } else {
                return deployableVersionFromSha;
            }
        }
    }

    @POST("/deployable-version")
    public void addDeployableVersion(String gitCommitSha, String githubRepositoryUrl, int serviceId, Req req) {
        DeployableVersion newDeployableVersion = new DeployableVersion();

        // Getting the commit details
        String actualRepo = getRepoNameFromRepositoryUrl(githubRepositoryUrl);
        CommitDetails commitDetails = GithubConnector.getCommitDetails(actualRepo, gitCommitSha);

        newDeployableVersion.setGitCommitSha(gitCommitSha);
        newDeployableVersion.setGithubRepositoryUrl(githubRepositoryUrl);
        newDeployableVersion.setServiceId(serviceId);

        // Not failing if this is null
        if (commitDetails != null) {
            newDeployableVersion.setCommitUrl(commitDetails.getCommitUrl());
            newDeployableVersion.setCommitMessage(commitDetails.getCommitMessage());
            newDeployableVersion.setCommitDate(commitDetails.getCommitDate());
            newDeployableVersion.setCommitterAvatarUrl(commitDetails.getCommitterAvatarUrl());
            newDeployableVersion.setCommitterName(commitDetails.getCommitterName());
        }

        deployableVersionDao.addDeployableVersion(newDeployableVersion);
        assignJsonResponseToReq(req, HttpStatus.CREATED, newDeployableVersion);
    }

    private String getRepoNameFromRepositoryUrl(String githubRepositoryUrl) {
        return githubRepositoryUrl.replaceFirst("https:\\/\\/github.com\\/", "");
    }

}
